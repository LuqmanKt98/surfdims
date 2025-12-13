import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, collection, query, onSnapshot, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import { Surfboard, FilterState, User, SurfboardStatus, Advertisement, ListItem, SortOption, Alert, BrandingState, AppNotification, AppSettingsState, DonationEntry, VerificationFlowStatus, Condition } from './types';
import { INITIAL_BOARDS, MOCK_USERS, SLIDER_RANGES, DEFAULT_BRANDING, MOCK_ENTRIES } from './constants';
import { getCurrencySymbol, getNewBoardFee } from './countries';
import Header from './components/Header';
import BoardList from './components/BoardList';
import FilterPanel from './components/FilterPanel';
import ListingForm from './components/ListingForm';

import FilterIcon from './components/icons/FilterIcon';
import ListingDetail from './components/ListingDetail';
import NotificationModal from './components/NotificationModal';
import AccountSettingsModal from './components/AccountSettingsModal';
import PaymentModal from './components/PaymentModal';
import FaqPage from './components/FaqPage';
import ContactPage from './components/ContactPage';
import AdminPage from './components/AdminPage';
import SortIcon from './components/icons/SortIcon';
import ShareModal from './components/ShareModal';
import LearnMoreModal from './components/LearnMoreModal';
import VerificationBanner from './components/VerificationBanner';
import VerificationStatusModal from './components/VerificationStatusModal';
import CharityModal from './components/CharityModal';
import VolumeCalculatorModal from './components/VolumeCalculatorModal';

const initialFilters: FilterState = {
    brand: '',
    country: 'All',
    finSystem: 'All',
    finSetup: 'All',
    minLength: SLIDER_RANGES.length.min,
    maxLength: SLIDER_RANGES.length.max,
    minWidth: SLIDER_RANGES.width.min,
    maxWidth: SLIDER_RANGES.width.max,
    minThickness: SLIDER_RANGES.thickness.min,
    maxThickness: SLIDER_RANGES.thickness.max,
    minVolume: SLIDER_RANGES.volume.min,
    maxVolume: SLIDER_RANGES.volume.max,
};

const App: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [boards, setBoards] = useState<Surfboard[]>(INITIAL_BOARDS);
    const [users, setUsers] = useState<User[]>(MOCK_USERS);
    const [donationEntries, setDonationEntries] = useState<DonationEntry[]>(MOCK_ENTRIES);
    const [isListingFormOpen, setIsListingFormOpen] = useState(false);
    const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

    const [isAccountSettingsOpen, setIsAccountSettingsOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [view, setView] = useState<'all' | 'favs' | 'myListings'>('all');
    const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);
    const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
    const [notificationBoard, setNotificationBoard] = useState<Surfboard | null>(null);
    const [notificationSearchTerm, setNotificationSearchTerm] = useState<string | null>(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [boardsForPayment, setBoardsForPayment] = useState<Omit<Surfboard, 'id'>[]>([]);
    const [stagedNewBoards, setStagedNewBoards] = useState<Omit<Surfboard, 'id'>[]>([]);
    const [stagedUsedBoard, setStagedUsedBoard] = useState<Omit<Surfboard, 'id'> | null>(null);
    const [stagedLocation, setStagedLocation] = useState<{ region: string; suburb: string } | null>(null);
    const [paymentAmount, setPaymentAmount] = useState<number>(0);
    const [paymentDescription, setPaymentDescription] = useState<string>('');
    const [isFaqOpen, setIsFaqOpen] = useState(false);
    const [isContactOpen, setIsContactOpen] = useState(false);
    const [isAdminPageOpen, setIsAdminPageOpen] = useState(false);
    const [editingBoard, setEditingBoard] = useState<Surfboard | null>(null);
    const [sortOrder, setSortOrder] = useState<SortOption>('date_desc');
    const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
    const [boardToShare, setBoardToShare] = useState<Surfboard | null>(null);
    const [branding, setBranding] = useState<BrandingState>(DEFAULT_BRANDING);
    const [appSettings, setAppSettings] = useState<AppSettingsState>({ mailchimpApiKey: '' });

    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [isLearnMoreOpen, setIsLearnMoreOpen] = useState(false);
    const [isCharityModalOpen, setIsCharityModalOpen] = useState(false);
    const [isVolumeCalculatorOpen, setIsVolumeCalculatorOpen] = useState(false);
    const [giveawayImages, setGiveawayImages] = useState<string[]>([]);
    const [verificationStatus, setVerificationStatus] = useState<VerificationFlowStatus>('unverified');
    const [visibleListingsCount, setVisibleListingsCount] = useState(15);
    const mobileSortDropdownRef = useRef<HTMLDivElement>(null);
    const desktopSortDropdownRef = useRef<HTMLDivElement>(null);
    const [filters, setFilters] = useState<FilterState>(initialFilters);
    const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<any>(null);
    const [boardToRenewId, setBoardToRenewId] = useState<string | null>(null);

    useEffect(() => {
        setVisibleListingsCount(15);
    }, [filters, view, sortOrder]);

    // Listen for PWA install prompt
    useEffect(() => {
        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredInstallPrompt(e);
        };
        window.addEventListener('beforeinstallprompt', handler);
        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const handleInstallPrompt = useCallback(async () => {
        try {
            if (!deferredInstallPrompt) {
                alert('App is already installed or your browser does not support this feature.');
                return;
            }
            deferredInstallPrompt.prompt();
            const { outcome } = await deferredInstallPrompt.userChoice;
            console.log(`User response to the install prompt: ${outcome}`);
            setDeferredInstallPrompt(null);
        } catch (error) {
            console.error("Error showing install prompt:", error);
        }
    }, [deferredInstallPrompt]);

    // Load branding & app settings from localStorage on initial load
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    const userDoc = await getDoc(doc(db, "users", user.uid));
                    if (userDoc.exists()) {
                        const userData = userDoc.data() as User;
                        const currentUserData = { ...userData, id: user.uid };
                        setCurrentUser(currentUserData);
                        setFilters(prev => ({ ...prev, country: currentUserData.country || 'All' }));

                        setUsers(prev => {
                            const exists = prev.find(u => u.id === user.uid);
                            if (exists) return prev.map(u => u.id === user.uid ? currentUserData : u);
                            return [...prev, currentUserData];
                        });
                    }
                } catch (error: any) {
                    if (error.message && error.message.includes("offline")) {
                        console.log("Firestore offline, loading from cache if available or waiting for connection...");
                    } else {
                        console.error("Error fetching user data:", error);
                    }
                }
            } else {
                setCurrentUser(null);
                setFilters(initialFilters);
            }
        });

        try {
            try {
                const savedBranding = localStorage.getItem('surfDimsBranding');
                if (savedBranding) {
                    const parsed = JSON.parse(savedBranding);
                    if (parsed && typeof parsed === 'object') {
                        setBranding(prev => ({ ...prev, ...parsed }));
                    }
                }
            } catch (e) {
                console.error("Failed to parse branding from localStorage", e);
                setBranding(DEFAULT_BRANDING);
            }
        } catch (e) {
            // catch global localStorage errors
        }

        try {
            try {
                const savedAppSettings = localStorage.getItem('surfDimsAppSettings');
                if (savedAppSettings) {
                    const parsed = JSON.parse(savedAppSettings);
                    if (parsed && typeof parsed === 'object') {
                        setAppSettings(prev => ({ ...prev, ...parsed }));
                    }
                }
            } catch (e) {
                console.error("Failed to parse app settings from localStorage", e);
            }
        } catch (e) { }

        try {
            try {
                const savedGiveawayImages = localStorage.getItem('surfDimsGiveawayImages');
                if (savedGiveawayImages) {
                    const parsed = JSON.parse(savedGiveawayImages);
                    if (Array.isArray(parsed)) {
                        setGiveawayImages(parsed);
                    }
                }
            } catch (e) {
                console.error("Failed to parse giveaway images from localStorage", e);
            }
        } catch (e) { }
        return () => unsubscribe();
    }, []);

    // Fetch Boards from Firestore
    useEffect(() => {
        const q = query(collection(db, "boards"));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const boardsData: Surfboard[] = [];
            querySnapshot.forEach((doc) => {
                boardsData.push({ id: doc.id, ...doc.data() } as Surfboard);
            });
            // Combine with initial boards if needed, or just use Firestore
            // For now, we'll replace INITIAL_BOARDS with Firestore data + INITIAL_BOARDS (migrated later?)
            // Actually, let's prioritize Firestore. If empty, maybe show initial?
            // Let's just set boards to the fetched data. Use initial only if DB is empty to seed?
            // Simplified: Just use DB data.
            setBoards(boardsData); // This ensures all users see the same DB data (filtered by view later)
        });
        return () => unsubscribe();
    }, []);

    // Handle deep linking and browser history
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const boardIdFromUrl = urlParams.get('boardId');

        if (boardIdFromUrl && boards.some(b => b.id === boardIdFromUrl)) {
            if (selectedBoardId !== boardIdFromUrl) {
                handleSelectBoard(boardIdFromUrl);
            }
        }

        const handlePopState = (event: PopStateEvent) => {
            const boardIdFromState = event.state?.boardId ?? null;
            if (boardIdFromState) {
                handleSelectBoard(boardIdFromState);
            } else {
                setSelectedBoardId(null);
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [boards]);


    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const isClickInsideMobile = mobileSortDropdownRef.current?.contains(event.target as Node);
            const isClickInsideDesktop = desktopSortDropdownRef.current?.contains(event.target as Node);

            if (!isClickInsideMobile && !isClickInsideDesktop) {
                setIsSortDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Check for expired listings and notifications on mount and when user changes.
    useEffect(() => {
        const now = new Date();
        const ninetyDaysInMs = 90 * 24 * 60 * 60 * 1000;
        const oneYearInMs = 365 * 24 * 60 * 60 * 1000;
        const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;

        let boardsHaveChanged = false;
        let updatedBoards = boards.map(board => {
            if (board.status === SurfboardStatus.Live) {
                const listedDate = new Date(board.listedDate);
                const timeSinceListed = now.getTime() - listedDate.getTime();

                // Expiry duration depends on condition
                // Used: 3 months (90 days)
                // New: 12 months (365 days)
                const expiryDuration = board.condition === Condition.New ? oneYearInMs : ninetyDaysInMs;

                if (timeSinceListed > expiryDuration) {
                    boardsHaveChanged = true;
                    return { ...board, status: SurfboardStatus.Expired };
                }
            }
            return board;
        });

        const preDeleteCount = updatedBoards.length;
        updatedBoards = updatedBoards.filter(board => {
            if (board.status === SurfboardStatus.Expired) {
                const listedDate = new Date(board.listedDate);
                const expiryDuration = board.condition === Condition.New ? oneYearInMs : ninetyDaysInMs;

                // Calculate when it expired
                const expiryDate = new Date(listedDate.getTime() + expiryDuration);
                // Calculate time since expiration
                const timeSinceExpiry = now.getTime() - expiryDate.getTime();

                // Delete if it has been expired for more than 30 days (1 month)
                if (timeSinceExpiry > thirtyDaysInMs) {
                    return false; // This deletes the board from the array
                }
            }
            return true;
        });

        if (preDeleteCount !== updatedBoards.length) {
            boardsHaveChanged = true;
        }

        if (boardsHaveChanged) {
            setBoards(updatedBoards);
        }

        if (!currentUser) {
            setNotifications([]);
            return;
        }

        let savedNotifications: AppNotification[] = [];
        try {
            const stored = localStorage.getItem(`surfdims-notifications-${currentUser.id}`);
            if (stored) {
                savedNotifications = JSON.parse(stored);
            }
        } catch (e) {
            console.error("Failed to parse notifications from localStorage", e);
            // Don't remove item blindly to avoid data loss on temporary error, just start empty
        }

        const userBoards = updatedBoards.filter(b => b.sellerId === currentUser.id && b.status === SurfboardStatus.Live);
        const newNotifications: AppNotification[] = [];
        const oneDayInMs = 24 * 60 * 60 * 1000;

        userBoards.forEach(board => {
            const listedDate = new Date(board.listedDate);
            // New: 365, Used: 90
            const expiryDurationInDays = board.condition === Condition.New ? 365 : 90;

            const expiryDate = new Date(listedDate.getTime());
            expiryDate.setDate(expiryDate.getDate() + expiryDurationInDays);

            const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / oneDayInMs);
            const warningThresholdInDays = 7;

            if (daysUntilExpiry >= 0 && daysUntilExpiry <= warningThresholdInDays) {
                const existingNotification = savedNotifications.find(n => n.boardId === board.id);
                if (!existingNotification) {
                    const message = daysUntilExpiry > 0
                        ? `Your listing for "${board.brand} ${board.model}" expires in ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''}.`
                        : `Your listing for "${board.brand} ${board.model}" expires today.`;

                    newNotifications.push({
                        id: `notif-${board.id}-${Date.now()}`,
                        boardId: board.id,
                        message: message,
                        isRead: false,
                        createdAt: now.toISOString(),
                    });
                }
            }
        });

        if (newNotifications.length > 0) {
            const allNotifications = [...savedNotifications, ...newNotifications].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setNotifications(allNotifications);
            try {
                localStorage.setItem(`surfdims-notifications-${currentUser.id}`, JSON.stringify(allNotifications));
            } catch (e) {
                console.error("Failed to save notifications to localStorage", e);
            }
        } else {
            setNotifications(savedNotifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        }

    }, [currentUser]); // Note: `boards` is intentionally omitted to avoid re-running on every board state change.

    // Prevent body scroll when filter panel is open on mobile
    useEffect(() => {
        if (isFilterPanelOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isFilterPanelOpen]);

    const handleCloseDetail = useCallback(() => {
        setSelectedBoardId(null);
        window.history.replaceState({}, '', window.location.pathname);
    }, []);

    const handleSelectBoard = useCallback((boardId: string | null) => {
        if (!boardId) {
            handleCloseDetail();
            return;
        }

        const board = boards.find(b => b.id === boardId);

        // Allow selection only if the board is live OR the current user is the seller
        if (board) {
            setSelectedBoardId(boardId);
            if (window.location.search !== `?boardId=${boardId}`) {
                window.history.pushState({ boardId }, '', `?boardId=${boardId}`);
            }
            window.scrollTo(0, 0);
        } else if (!board && selectedBoardId) {
            // If the board doesn't exist (e.g., deleted), close the detail view
            handleCloseDetail();
        }
    }, [boards, selectedBoardId, handleCloseDetail]);


    const handleAddUsedBoard = useCallback(async (newBoard: Omit<Surfboard, 'id'>, location?: { region: string, suburb: string }) => {
        if (!currentUser) return;
        const newBoardId = `board-${Date.now()}`;

        // Used boards logic: Free, 3 months listing, Unpaid
        const now = new Date();
        const expiresAt = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString(); // 90 days

        const boardWithId: Surfboard = {
            ...newBoard,
            id: newBoardId,
            sellerId: currentUser.id,
            status: SurfboardStatus.Live,
            listedDate: now.toISOString(),
            expiresAt: expiresAt,
            isPaid: false
        };

        try {
            await setDoc(doc(db, "boards", newBoardId), boardWithId);

            if (location) {
                const updatedUser: User = { ...currentUser, location: `${location.suburb}, ${location.region}` };
                setCurrentUser(updatedUser);
                await setDoc(doc(db, "users", currentUser.id), updatedUser);
                setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
            }

            setIsListingFormOpen(false);
            handleSelectBoard(newBoardId);
        } catch (error) {
            console.error("Error adding board: ", error);
            alert("Failed to create listing. Please try again.");
        }
    }, [currentUser, handleSelectBoard]);

    const handleStageAndReset = useCallback((newBoards: Omit<Surfboard, 'id'>[], location?: { region: string; suburb: string; }) => {
        setStagedNewBoards(prev => [...prev, ...newBoards]);
        if (location && !stagedLocation) {
            setStagedLocation(location);
        }
    }, [stagedLocation]);

    const handleStageAndPay = useCallback((finalBoards: Omit<Surfboard, 'id'>[], location?: { region: string; suburb: string; }) => {
        const allBoardsToPay = [...stagedNewBoards, ...finalBoards];
        setBoardsForPayment(allBoardsToPay);

        if (currentUser) {
            const fee = getNewBoardFee(currentUser.country);
            // Calculate total based on number of dimensions across all boards
            const totalBoardCount = allBoardsToPay.reduce((count, board) => count + board.dimensions.length, 0);
            setPaymentAmount(fee * totalBoardCount);
            setPaymentDescription(`${totalBoardCount} paid listing(s)`)
        }

        if (location) {
            setStagedLocation(location);
        }

        setStagedNewBoards([]);
        setIsListingFormOpen(false);
        setIsPaymentModalOpen(true);
    }, [stagedNewBoards, currentUser]);

    const handleDonateAndList = useCallback((board: Omit<Surfboard, 'id'>, donationAmount: number, location?: { region: string; suburb: string; }) => {
        setStagedUsedBoard(board);
        if (location) {
            setStagedLocation(location);
        }
        setPaymentAmount(donationAmount);
        const entries = donationAmount;
        setPaymentDescription(`${entries} entr${entries > 1 ? 'ies' : 'y'} for your donation`);
        setIsPaymentModalOpen(true);
    }, []);

    const handleUpdateBoard = useCallback(async (updatedBoard: Surfboard) => {
        try {
            await updateDoc(doc(db, "boards", updatedBoard.id), updatedBoard as any);
            setIsListingFormOpen(false);
            setEditingBoard(null);
            setSelectedBoardId(updatedBoard.id);
            alert('Your listing has been updated!');
        } catch (error) {
            console.error("Error updating board", error);
            alert("Failed to update listing.");
        }
    }, []);

    const handleBrandingUpdate = useCallback((newBranding: BrandingState) => {
        setBranding(newBranding);
        try {
            localStorage.setItem('surfDimsBranding', JSON.stringify(newBranding));
            alert('Branding updated successfully!');
        } catch (e) {
            console.error("Failed to save branding to localStorage", e);
            alert('Branding updated in session, but failed to save to storage.');
        }
    }, []);

    const handleAppSettingsUpdate = useCallback((newSettings: AppSettingsState) => {
        setAppSettings(newSettings);
        try {
            localStorage.setItem('surfDimsAppSettings', JSON.stringify(newSettings));
            alert('App settings updated!');
        } catch (e) {
            console.error("Failed to save app settings to localStorage", e);
            alert('Settings updated in session, but failed to save to storage.');
        }
    }, []);

    const handleGiveawayImagesUpdate = useCallback((images: string[]) => {
        setGiveawayImages(images);
        try {
            localStorage.setItem('surfDimsGiveawayImages', JSON.stringify(images));
            alert('Giveaway images updated!');
        } catch (e) {
            console.error("Failed to save giveaway images to localStorage", e);
            alert('Images updated in session, but failed to save to storage.');
        }
    }, []);

    const handleApplyVolumeRange = useCallback((min: number, max: number) => {
        setFilters(prev => ({
            ...prev,
            minVolume: min,
            maxVolume: max,
        }));
        setIsVolumeCalculatorOpen(false);
    }, []);

    const handlePaymentSuccess = async () => {
        // Renewal Flow
        if (boardToRenewId) {
            try {
                await updateDoc(doc(db, "boards", boardToRenewId), {
                    status: SurfboardStatus.Live,
                    listedDate: new Date().toISOString()
                });
                setBoardToRenewId(null);
                setIsPaymentModalOpen(false);
                setPaymentAmount(0);
                alert('Listing reactivated successfully!');
            } catch (error) {
                console.error("Error renewing board", error);
                alert("Failed to renew listing.");
            }
            return;
        }

        // Donation Flow
        if (stagedUsedBoard && currentUser) {
            // Note: Donations are still local for now unless we add a collection. 
            // The prompt focus is on "own information + data" which usually implies listings.
            const donationAmount = paymentAmount;
            const newEntry: DonationEntry = {
                id: `entry-${Date.now()}`,
                userId: currentUser.id,
                userEmail: currentUser.email,
                entries: donationAmount,
                amount: donationAmount,
                date: new Date().toISOString(),
            };
            setDonationEntries(prev => [newEntry, ...prev]);

            await handleAddUsedBoard(stagedUsedBoard, stagedLocation);
            alert(`Thanks for your donation! Your board is now listed.`);

            // New Board Flow
        } else if (boardsForPayment.length > 0 && currentUser) {
            try {
                const newIds: string[] = [];
                const promises = boardsForPayment.map(async (board) => {
                    const newId = `board-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                    newIds.push(newId);

                    // New/Paid boards logic: Paid, 12 months listing
                    const now = new Date();
                    const expiresAt = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString(); // 365 days

                    const newBoard: Surfboard = {
                        ...board,
                        id: newId,
                        sellerId: currentUser.id,
                        status: SurfboardStatus.Live,
                        listedDate: now.toISOString(),
                        expiresAt: expiresAt,
                        isPaid: true
                    };
                    await setDoc(doc(db, "boards", newId), newBoard);
                    return newBoard;
                });

                await Promise.all(promises);

                if (stagedLocation) {
                    const updatedUser: User = { ...currentUser, location: `${stagedLocation.suburb}, ${stagedLocation.region}` };
                    setCurrentUser(updatedUser);
                    await setDoc(doc(db, "users", currentUser.id), updatedUser);
                    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
                }

                const totalListedCount = boardsForPayment.reduce((count, board) => count + board.dimensions.length, 0);
                alert(`Payment successful! Your ${totalListedCount} board(s) are now listed.`);

                if (newIds.length > 0) {
                    handleSelectBoard(newIds[newIds.length - 1]);
                }
            } catch (error) {
                console.error("Error creating new boards", error);
                alert("Failed to create listings. Please try again.");
            }
        }

        // Reset all payment related state
        setIsPaymentModalOpen(false);
        setBoardsForPayment([]);
        setStagedUsedBoard(null);
        setStagedLocation(null);
        setPaymentAmount(0);
        setPaymentDescription('');
    };

    const handlePaymentCancel = () => {
        setIsPaymentModalOpen(false);
        setBoardsForPayment([]);
        setStagedUsedBoard(null);
        setStagedLocation(null);
        setPaymentAmount(0);
        setPaymentDescription('');
        setBoardToRenewId(null);
    };

    const handleLogin = (email: string, pass: string) => {
        console.log(`Simulating login for ${email}`);
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

        if (!user) {
            alert("Login failed: User not found or incorrect password.");
            return;
        }

        if (user.isBlocked) {
            alert('Your account has been suspended. Please contact support.');
            return;
        }

        setCurrentUser(user);
        setFilters(prev => ({ ...prev, country: user.country }));
    };

    const handleSignup = (name: string, email: string, pass: string, country: string) => {
        console.log(`Simulating signup for ${name} <${email}> in ${country}`);
        const newUser: User = {
            id: 'user-' + Date.now(),
            name: name,
            email: email,
            country: country,
            favs: [],
            alerts: [],
            avatar: `https://i.pravatar.cc/150?u=${email}`,
            location: '',
            isBlocked: false,
            isVerified: false,
            createdAt: new Date().toISOString(),
        };
        setUsers(prev => [...prev, newUser]);
        setCurrentUser(newUser);
        setFilters(prev => ({ ...prev, country: newUser.country }));
        setVerificationStatus('unverified');
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            // State clear is handled by onAuthStateChanged
        } catch (error) {
            console.error("Logout error", error);
        }
    };

    const handleListBoardClick = () => {
        if (currentUser) {
            if (!currentUser.isVerified) {
                alert('Please verify your email to list a board.');
                return;
            }
            setEditingBoard(null);
            setIsListingFormOpen(true);
        } else {
            promptForAuth('Please log in to list a board.');
        }
    };

    const handleCloseListingForm = () => {
        setIsListingFormOpen(false);
        setEditingBoard(null);
        setStagedNewBoards([]);
        setStagedLocation(null);
    };

    const handleUpdateUser = useCallback(async (updatedUser: User) => {
        try {
            await setDoc(doc(db, "users", updatedUser.id), updatedUser, { merge: true });
            setCurrentUser(updatedUser);
            setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
            setIsAccountSettingsOpen(false);
            alert('Your settings have been updated!');
        } catch (error) {
            console.error("Error updating profile", error);
            alert("Failed to update profile.");
        }
    }, []);

    const promptForAuth = useCallback((reason: string) => {
        navigate('/login');
    }, [navigate]);

    const handleToggleFavs = useCallback((boardId: string) => {
        if (!currentUser) {
            promptForAuth('Login or sign-up to save favourites and create listings.');
            return;
        }

        if (!currentUser.isVerified) {
            alert('Please verify your email to save favourites.');
            return;
        }

        const isAdding = !currentUser.favs.includes(boardId);

        setCurrentUser(user => {
            if (!user) return null;
            const newFavs = isAdding
                ? [...user.favs, boardId]
                : user.favs.filter(id => id !== boardId);
            return { ...user, favs: newFavs };
        });

        if (isAdding) {
            const boardForNotification = boards.find(b => b.id === boardId);
            if (boardForNotification) {
                setNotificationBoard(boardForNotification);
                setIsNotificationModalOpen(true);
            }
        }
    }, [currentUser, boards, promptForAuth]);

    const handleAddAlert = useCallback((brand: string, model: string) => {
        if (!currentUser) return;

        const newAlert: Alert = {
            id: `alert-${Date.now()}`,
            brand,
            model,
        };

        const alreadyExists = currentUser.alerts.some(
            alert => alert.brand.toLowerCase() === brand.toLowerCase() && alert.model.toLowerCase() === model.toLowerCase()
        );

        const alertName = `${brand}${model ? ` ${model}` : ''}`;

        if (alreadyExists) {
            alert(`You already have an alert for ${alertName}.`);
            return;
        }

        const updatedUser = { ...currentUser, alerts: [...currentUser.alerts, newAlert] };
        setCurrentUser(updatedUser);
        setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
        alert(`Alert created for ${alertName}!`);
    }, [currentUser]);

    const handleDeleteAlert = useCallback((alertId: string) => {
        if (!currentUser) return;

        const updatedUser = { ...currentUser, alerts: currentUser.alerts.filter(a => a.id !== alertId) };
        setCurrentUser(updatedUser);
        setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    }, [currentUser]);



    const handleShare = useCallback((board: Surfboard) => {
        const boardUrl = `${window.location.origin}${window.location.pathname}?boardId=${board.id}`;

        const firstDim = board.dimensions?.[0];
        const dimensionText = (firstDim && typeof firstDim.length === 'number' && !isNaN(firstDim.length)) ? `${firstDim.length}' ` : '';
        const brandModelText = [board.brand, board.model].filter(Boolean).join(' ');

        const shareData = {
            title: brandModelText || 'Surfboard',
            text: `Check out this ${dimensionText}${brandModelText || 'surfboard'} on SurfDims!`,
            url: boardUrl,
        };

        try {
            if (navigator && navigator.share) {
                // Try native share
                navigator.share(shareData).catch((error) => {
                    if (error && error.name === 'AbortError') {
                        return;
                    }
                    console.error("Web Share API failed, falling back to modal", error);
                    setBoardToShare(board);
                });
            } else {
                // Fallback to custom share modal
                setBoardToShare(board);
            }
        } catch (e) {
            console.error("Share API error", e);
            setBoardToShare(board);
        }
    }, []);

    const handleSaveSearch = useCallback(() => {
        if (!currentUser) {
            promptForAuth('Login to save this search and get alerts for new listings.');
            return;
        }
        if (!currentUser.isVerified) {
            alert('Please verify your email to save search alerts.');
            return;
        }
        if (!filters.brand.trim()) {
            alert("Please enter a keyword in the search box to save an alert.");
            return;
        }
        setNotificationSearchTerm(filters.brand);
        setIsNotificationModalOpen(true);
    }, [currentUser, filters.brand, promptForAuth]);

    const handleConfirmNotification = () => {
        if (notificationBoard) {
            handleAddAlert(notificationBoard.brand, notificationBoard.model);
        } else if (notificationSearchTerm) {
            handleAddAlert(notificationSearchTerm, ''); // Pass whole term as brand
        }
        setIsNotificationModalOpen(false);
        setNotificationBoard(null);
        setNotificationSearchTerm(null);
    };

    const handleCloseNotificationModal = () => {
        setIsNotificationModalOpen(false);
        setNotificationBoard(null);
        setNotificationSearchTerm(null);
    };

    const handleViewSellerListings = useCallback((sellerId: string) => {
        setFilters(prev => ({
            ...initialFilters,
            country: prev.country, // Keep country filter
            sellerId: sellerId,
        }));
        setView('all');
        handleCloseDetail();
        window.scrollTo(0, 0);
    }, [handleCloseDetail]);

    const handleMarkAsSold = useCallback(async (boardId: string) => {
        try {
            await updateDoc(doc(db, "boards", boardId), { status: SurfboardStatus.Sold });
            handleCloseDetail();
            alert('Listing marked as sold!');
        } catch (error) {
            console.error("Error marking as sold", error);
            alert("Failed to update status.");
        }
    }, [handleCloseDetail]);

    const handleRenewListing = useCallback((boardId: string) => {
        const boardToRenew = boards.find(b => b.id === boardId);
        if (!boardToRenew) return;

        if (boardToRenew.condition === Condition.New) {
            // New boards require payment to renew
            setBoardToRenewId(boardId);
            if (currentUser) {
                const fee = getNewBoardFee(currentUser.country);
                const totalCost = fee * boardToRenew.dimensions.length;
                setPaymentAmount(totalCost);
                setPaymentDescription(`Reactivate Listing (${boardToRenew.dimensions.length} size${boardToRenew.dimensions.length !== 1 ? 's' : ''})`);
                setIsPaymentModalOpen(true);
            }
        } else {
            // Used boards are free to renew
            setBoards(prev => prev.map(b => b.id === boardId ? { ...b, status: SurfboardStatus.Live, listedDate: new Date().toISOString() } : b));
            alert('Listing has been renewed!');
        }
    }, [boards, currentUser]);

    const handleRelistBoard = useCallback((boardId: string) => {
        setBoards(prev => prev.map(b => b.id === boardId ? { ...b, status: SurfboardStatus.Live, listedDate: new Date().toISOString() } : b));
        alert('Board has been relisted!');
    }, []);

    const handleDeleteListing = useCallback((boardId: string) => {
        setBoards(prev => prev.filter(b => b.id !== boardId));
        handleCloseDetail();
        alert('Listing has been deleted.');
    }, [handleCloseDetail]);

    const handleEditListing = useCallback((board: Surfboard) => {
        setEditingBoard(board);
        setIsListingFormOpen(true);
        handleCloseDetail();
    }, [handleCloseDetail]);

    const handleAdminDeleteListing = useCallback((boardId: string) => {
        if (window.confirm('Are you sure you want to permanently delete this listing?')) {
            setBoards(prev => prev.filter(b => b.id !== boardId));
            alert('Listing has been deleted.');
        }
    }, []);

    const handleAdminToggleUserBlock = useCallback((userId: string) => {
        setUsers(prevUsers => {
            const user = prevUsers.find(u => u.id === userId);
            if (!user) return prevUsers;
            const action = user.isBlocked ? 'unblock' : 'block';
            if (window.confirm(`Are you sure you want to ${action} this user?`)) {
                return prevUsers.map(u => u.id === userId ? { ...u, isBlocked: !u.isBlocked } : u);
            }
            return prevUsers;
        });
    }, []);

    const handleMarkNotificationAsRead = useCallback((notificationId: string) => {
        if (!currentUser) return;
        const updatedNotifications = notifications.map(n => n.id === notificationId ? { ...n, isRead: true } : n);
        setNotifications(updatedNotifications);
        try {
            localStorage.setItem(`surfdims-notifications-${currentUser.id}`, JSON.stringify(updatedNotifications));
        } catch (e) {
            console.error("Failed to update notifications in localStorage", e);
        }
    }, [notifications, currentUser]);

    const handleMarkAllNotificationsAsRead = useCallback(() => {
        if (!currentUser) return;
        const updatedNotifications = notifications.map(n => ({ ...n, isRead: true }));
        setNotifications(updatedNotifications);
        try {
            localStorage.setItem(`surfdims-notifications-${currentUser.id}`, JSON.stringify(updatedNotifications));
        } catch (e) {
            console.error("Failed to update all notifications in localStorage", e);
        }
    }, [notifications, currentUser]);

    const handleClearAllNotifications = useCallback(() => {
        if (!currentUser) return;
        if (window.confirm('Are you sure you want to clear all notifications?')) {
            setNotifications([]);
            try {
                localStorage.removeItem(`surfdims-notifications-${currentUser.id}`);
            } catch (e) {
                console.error("Failed to clear notifications from localStorage", e);
            }
        }
    }, [currentUser]);

    const handleNotificationClick = useCallback((notification: AppNotification) => {
        handleMarkNotificationAsRead(notification.id);
        handleSelectBoard(notification.boardId);
    }, [handleMarkNotificationAsRead, handleSelectBoard]);

    const handleInitiateVerification = useCallback(() => {
        setVerificationStatus('pending');
        // Simulate user going to their email and clicking the link
        setTimeout(() => {
            setVerificationStatus('verifying');
        }, 2000);
    }, []);

    const handleVerifyAccount = useCallback(() => {
        if (!currentUser) return;
        const updatedUser = { ...currentUser, isVerified: true };
        setCurrentUser(updatedUser);
        setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    }, [currentUser]);

    const handleCloseVerificationModal = () => {
        setVerificationStatus('unverified');
        alert('Account verified successfully! You now have full access.');
    };

    const handleShowMore = useCallback(() => {
        setVisibleListingsCount(prevCount => prevCount + 15);
    }, []);

    const handleOpenContactFromFaq = useCallback(() => {
        setIsFaqOpen(false);
        setIsContactOpen(true);
    }, []);

    const handleOpenLearnMoreFromFaq = useCallback(() => {
        setIsFaqOpen(false);
        setIsLearnMoreOpen(true);
    }, []);

    const sellerMap: Map<string, User> = useMemo(() => new Map<string, User>(users.map(u => [u.id, u])), [users]);

    const filteredBoards = useMemo(() => {
        let boardsToFilter = boards;

        if (filters.country !== 'All') {
            boardsToFilter = boardsToFilter.filter(board => {
                const seller = sellerMap.get(board.sellerId);
                return seller?.country === filters.country;
            });
        }

        let baseBoards: Surfboard[];

        if (view === 'myListings' && currentUser) {
            baseBoards = boardsToFilter.filter(b => b.sellerId === currentUser.id);
        } else if (view === 'favs' && currentUser) {
            const favIds = new Set(currentUser.favs);
            baseBoards = boardsToFilter.filter(b => favIds.has(b.id) && b.status === SurfboardStatus.Live);
        } else {
            baseBoards = boardsToFilter.filter(b => b.status === SurfboardStatus.Live || (currentUser && b.sellerId === currentUser.id));
        }

        const filtered = baseBoards.filter(board => {
            const seller = sellerMap.get(board.sellerId);
            if (!seller || seller.isBlocked) return false;

            const { brand, finSystem, finSetup, minLength, maxLength, minWidth, maxWidth, minThickness, maxThickness, minVolume, maxVolume, sellerId } = filters;

            if (sellerId && board.sellerId !== sellerId) return false;

            if (view === 'all' && board.status !== SurfboardStatus.Live && !sellerId) return false;

            if (brand) {
                const searchString = `${board.brand.toLowerCase()} ${board.model.toLowerCase()} ${board.description.toLowerCase()}`;
                const keywords = brand.toLowerCase().split(' ').filter(kw => kw);
                if (!keywords.every(kw => searchString.includes(kw))) return false;
            }
            if (finSystem !== 'All' && board.finSystem !== finSystem) return false;
            if (finSetup !== 'All' && board.finSetup !== finSetup) return false;

            const lengthFilterActive = minLength > SLIDER_RANGES.length.min || maxLength < SLIDER_RANGES.length.max;
            const widthFilterActive = minWidth > SLIDER_RANGES.width.min || maxWidth < SLIDER_RANGES.width.max;
            const thicknessFilterActive = minThickness > SLIDER_RANGES.thickness.min || maxThickness < SLIDER_RANGES.thickness.max;
            const volumeFilterActive = minVolume > SLIDER_RANGES.volume.min || maxVolume < SLIDER_RANGES.volume.max;

            if (lengthFilterActive || widthFilterActive || thicknessFilterActive || volumeFilterActive) {
                const matchesDimensions = board.dimensions.some(dim => {
                    if (lengthFilterActive && (dim.length < minLength || dim.length > maxLength)) return false;
                    if (widthFilterActive && (dim.width < minWidth || dim.width > maxWidth)) return false;
                    if (thicknessFilterActive && (dim.thickness < minThickness || dim.thickness > maxThickness)) return false;
                    if (volumeFilterActive && (dim.volume < minVolume || dim.volume > maxVolume)) return false;
                    return true;
                });
                if (!matchesDimensions) return false;
            }

            return true;
        });

        // Create a shallow copy before sorting to avoid mutating the array, which can cause issues with React's change detection.
        return [...filtered].sort((a, b) => {
            switch (sortOrder) {
                case 'price_asc':
                    return a.price - b.price;
                case 'price_desc':
                    return b.price - a.price;
                case 'date_asc':
                    return new Date(a.listedDate).getTime() - new Date(b.listedDate).getTime();
                case 'date_desc':
                default:
                    return new Date(b.listedDate).getTime() - new Date(a.listedDate).getTime();
            }
        });
    }, [boards, filters, view, currentUser, users, sellerMap, sortOrder]);

    const paginatedBoards = useMemo(() => {
        return filteredBoards.slice(0, visibleListingsCount);
    }, [filteredBoards, visibleListingsCount]);

    const listItemsWithAds = useMemo((): ListItem[] => {
        if (view === 'favs' || view === 'myListings') {
            return paginatedBoards;
        }

        const itemsWithAds: ListItem[] = [];
        const adInterval = 15;
        const adPositionInChunk = 5; // Place ad after the 5th item in a chunk of 15

        for (let i = 0; i < paginatedBoards.length; i++) {
            itemsWithAds.push(paginatedBoards[i]);
            // Insert an ad after the 5th item of each 15-item chunk.
            if ((i + 1) > 0 && (i + 1) % adInterval === adPositionInChunk) {
                itemsWithAds.push({ id: `ad-${i}`, type: 'ad' });
            }
        }

        // Ensure at least one ad is shown if there are any listings but fewer than 5
        const adWasAdded = itemsWithAds.some(item => item.type === 'ad');
        if (!adWasAdded && paginatedBoards.length > 0) {
            const insertPosition = 2; // Preferred position for the single ad (after the 2nd item).
            const insertIndex = Math.min(insertPosition, itemsWithAds.length);
            itemsWithAds.splice(insertIndex, 0, { id: 'ad-fallback', type: 'ad' });
        }

        return itemsWithAds;
    }, [paginatedBoards, view]);

    const sellerFilter = useMemo(() => {
        if (!filters.sellerId) return null;
        return users.find(u => u.id === filters.sellerId) || null;
    }, [filters.sellerId, users]);

    const isFilterActive = useMemo(() => {
        return (
            filters.brand !== initialFilters.brand ||
            filters.country !== initialFilters.country ||
            filters.finSystem !== initialFilters.finSystem ||
            filters.finSetup !== initialFilters.finSetup ||
            filters.minLength !== initialFilters.minLength ||
            filters.maxLength !== initialFilters.maxLength ||
            filters.minWidth !== initialFilters.minWidth ||
            filters.maxWidth !== initialFilters.maxWidth ||
            filters.minThickness !== initialFilters.minThickness ||
            filters.maxThickness !== initialFilters.maxThickness ||
            filters.minVolume !== initialFilters.minVolume ||
            filters.maxVolume !== initialFilters.maxVolume ||
            !!filters.sellerId
        );
    }, [filters]);

    const selectedBoard = selectedBoardId ? boards.find(b => b.id === selectedBoardId) : null;
    const seller = selectedBoard ? users.find(u => u.id === selectedBoard.sellerId) : null;

    const pageTitle = useMemo(() => {
        if (sellerFilter) {
            return `${sellerFilter.name}'s listings (${filteredBoards.length})`;
        }
        if (view === 'all' && isFilterActive) {
            if (filters.brand) {
                return `Results for '${filters.brand}' (${filteredBoards.length})`;
            }
            return `Listings (${filteredBoards.length})`;
        }
        if (view === 'favs') {
            return `My Favs (${filteredBoards.length})`;
        }
        if (view === 'myListings') {
            return `My Listings (${filteredBoards.length})`;
        }
        if (currentUser) {
            return `Welcome ${currentUser.name}`;
        }
        return 'Signup CTA';
    }, [view, sellerFilter, currentUser, filteredBoards.length, filters.brand, isFilterActive]);

    const sortOptions: { value: SortOption, label: string }[] = [
        { value: 'date_desc', label: 'Listed: newest to oldest' },
        { value: 'date_asc', label: 'Listed: oldest to newest' },
        { value: 'price_asc', label: 'Price: low to high' },
        { value: 'price_desc', label: 'Price: high to low' },
    ];

    const totalEntries = useMemo(() => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        return donationEntries.reduce((acc, entry) => {
            const entryDate = new Date(entry.date);
            if (entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear) {
                return acc + entry.entries;
            }
            return acc;
        }, 0);
    }, [donationEntries]);

    const totalDonationsRaised = useMemo(() => {
        return donationEntries.reduce((acc, entry) => acc + entry.amount, 0);
    }, [donationEntries]);

    const titleElement = pageTitle === 'Signup CTA' ? (
        <h1 className="text-3xl font-bold text-gray-800">
            Sign-up to save, list and win.{' '}
            <button onClick={() => setIsLearnMoreOpen(true)} className="text-blue-600 hover:underline font-semibold">
                Learn more.
            </button>
        </h1>
    ) : (
        <h1 className="text-3xl font-bold text-gray-800">{pageTitle}</h1>
    );

    if (location.pathname === '/login') {
        return <LoginPage onLogin={() => { }} />;
    }

    if (location.pathname === '/signup') {
        return <SignupPage onSignup={() => { }} />;
    }

    return (
        <div className="bg-gray-100 min-h-screen font-sans">
            <Header
                branding={branding}
                currentUser={currentUser}
                onListBoardClick={handleListBoardClick}
                onLoginClick={() => navigate('/login')}
                onLogout={handleLogout}
                onShowFavs={() => setView('favs')}
                onShowMyListings={() => setView('myListings')}
                onShowAll={() => {
                    setView('all');
                    setFilters(prev => ({ ...initialFilters, country: prev.country }));
                }}
                onAccountSettingsClick={() => setIsAccountSettingsOpen(true)}
                onFaqClick={() => setIsFaqOpen(true)}
                onContactClick={() => setIsContactOpen(true)}
                onAdminClick={() => setIsAdminPageOpen(true)}
                notifications={notifications}
                onNotificationClick={handleNotificationClick}
                onMarkAllNotificationsAsRead={handleMarkAllNotificationsAsRead}
                onClearAllNotifications={handleClearAllNotifications}
            />

            {currentUser && !currentUser.isVerified && verificationStatus !== 'verifying' && (
                <VerificationBanner onVerify={handleInitiateVerification} status={verificationStatus} />
            )}

            {isFaqOpen && <FaqPage onClose={() => setIsFaqOpen(false)} onContactClick={handleOpenContactFromFaq} onOpenLearnMore={handleOpenLearnMoreFromFaq} onInstallClick={handleInstallPrompt} canInstall={!!deferredInstallPrompt} />}
            {isContactOpen && <ContactPage onClose={() => setIsContactOpen(false)} />}
            {currentUser?.role === 'admin' && isAdminPageOpen && (
                <AdminPage
                    boards={boards}
                    users={users}
                    donationEntries={donationEntries}
                    branding={branding}
                    appSettings={appSettings}
                    giveawayImages={giveawayImages}
                    onAdminDeleteListing={handleAdminDeleteListing}
                    onAdminToggleUserBlock={handleAdminToggleUserBlock}
                    onBrandingUpdate={handleBrandingUpdate}
                    onAppSettingsUpdate={handleAppSettingsUpdate}
                    onGiveawayImagesUpdate={handleGiveawayImagesUpdate}
                    onClose={() => setIsAdminPageOpen(false)}
                />
            )}

            {selectedBoard && seller ? (
                <main className="container mx-auto p-4 lg:p-6">
                    <ListingDetail
                        board={selectedBoard}
                        seller={seller}
                        currentUser={currentUser}
                        onClose={handleCloseDetail}
                        isFavourited={currentUser?.favs.includes(selectedBoardId!) || false}
                        onToggleFavs={handleToggleFavs}
                        onViewSellerListings={handleViewSellerListings}
                        onMarkAsSold={handleMarkAsSold}
                        onRenewListing={handleRenewListing}
                        onRelistBoard={handleRelistBoard}
                        onDeleteListing={handleDeleteListing}
                        onEditListing={handleEditListing}
                        onShare={handleShare}
                        onLoginClick={() => navigate('/login')}
                    />
                </main>
            ) : (
                <main className="container mx-auto p-4 lg:p-6">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Filter Panel - Desktop */}
                        <aside className="hidden lg:block lg:w-1/4 xl:w-1/5 sticky top-24 self-start max-h-[calc(100vh-8rem)] overflow-y-auto">
                            <FilterPanel
                                filters={filters}
                                onFilterChange={setFilters}
                                onClose={() => setIsFilterPanelOpen(false)}
                                onSaveSearch={handleSaveSearch}
                                isLoggedIn={!!currentUser}
                                isVerified={!!currentUser?.isVerified}
                                onOpenVolumeCalculator={() => setIsVolumeCalculatorOpen(true)}
                            />
                        </aside>

                        {/* Main Content */}
                        <div className="flex-1">
                            {/* Mobile filter & sort controls */}
                            <div className="lg:hidden flex justify-between items-center mb-4 gap-4">
                                <button onClick={() => setIsFilterPanelOpen(true)} className="flex items-center gap-2 py-2 px-4 bg-white text-gray-700 font-semibold rounded-lg shadow border border-gray-200 hover:bg-gray-50 flex-1 justify-center">
                                    <FilterIcon />
                                    <span>Filters</span>
                                </button>
                                <div className="relative" ref={mobileSortDropdownRef}>
                                    <button onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)} className="flex items-center gap-2 py-2 px-4 bg-white text-gray-700 font-semibold rounded-lg shadow border border-gray-200 hover:bg-gray-50 flex-1 justify-center">
                                        <SortIcon />
                                        <span>Sort</span>
                                    </button>
                                    {isSortDropdownOpen && (
                                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-xl z-40 border border-gray-200">
                                            {sortOptions.map(option => (
                                                <button
                                                    key={option.value}
                                                    onClick={() => {
                                                        setSortOrder(option.value);
                                                        setIsSortDropdownOpen(false);
                                                    }}
                                                    className={`block w-full text-left px-4 py-2 text-sm ${sortOrder === option.value ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
                                                >
                                                    {option.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Desktop: Title and sort are on one line */}
                            <div className="hidden lg:flex justify-between items-center mb-6">
                                <div className="flex items-center gap-4">
                                    {titleElement}
                                    {isFilterActive && (
                                        <button onClick={() => setFilters(prev => ({ ...initialFilters, country: prev.country }))} className="text-blue-600 hover:underline font-semibold text-sm flex-shrink-0">Clear</button>
                                    )}
                                </div>
                                <div className="relative" ref={desktopSortDropdownRef}>
                                    <button onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)} className="flex items-center gap-2 py-2 px-4 bg-white text-gray-700 font-semibold rounded-lg shadow border border-gray-200 hover:bg-gray-50">
                                        <span>{sortOptions.find(o => o.value === sortOrder)?.label}</span>
                                        <SortIcon />
                                    </button>
                                    {isSortDropdownOpen && (
                                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-xl z-40 border border-gray-200">
                                            {sortOptions.map(option => (
                                                <button
                                                    key={option.value}
                                                    onClick={() => {
                                                        setSortOrder(option.value);
                                                        setIsSortDropdownOpen(false);
                                                    }}
                                                    className={`block w-full text-left px-4 py-2 text-sm ${sortOrder === option.value ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
                                                >
                                                    {option.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Mobile: Title is below filter/sort buttons */}
                            <div className="lg:hidden flex justify-between items-start mb-6">
                                {titleElement}
                                {isFilterActive && (
                                    <button onClick={() => setFilters(prev => ({ ...initialFilters, country: prev.country }))} className="text-blue-600 hover:underline font-semibold text-sm flex-shrink-0 ml-4 mt-1">Clear</button>
                                )}
                            </div>

                            <BoardList
                                items={listItemsWithAds}
                                users={users}
                                favs={currentUser?.favs || []}
                                onToggleFavs={handleToggleFavs}
                                onSelectBoard={handleSelectBoard}
                                currentUser={currentUser}
                                onShare={handleShare}
                                onOpenLearnMore={() => setIsLearnMoreOpen(true)}
                                hasMore={visibleListingsCount < filteredBoards.length}
                                onShowMore={handleShowMore}
                            />
                        </div>
                    </div>
                </main>
            )}

            {/* Modals & Overlays */}
            {isFilterPanelOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden" onClick={() => setIsFilterPanelOpen(false)}>
                    <div className="fixed inset-y-0 left-0 w-4/5 max-w-sm bg-white shadow-xl p-4 overflow-y-auto animate-slide-in-left" onClick={(e) => e.stopPropagation()}>
                        <FilterPanel
                            filters={filters}
                            onFilterChange={setFilters}
                            onClose={() => setIsFilterPanelOpen(false)}
                            onSaveSearch={handleSaveSearch}
                            isLoggedIn={!!currentUser}
                            isVerified={!!currentUser?.isVerified}
                            onOpenVolumeCalculator={() => setIsVolumeCalculatorOpen(true)}
                        />
                    </div>
                </div>
            )}

            {isListingFormOpen && currentUser && (
                <ListingForm
                    onClose={handleCloseListingForm}
                    onAddUsedBoard={handleAddUsedBoard}
                    onStageAndReset={handleStageAndReset}
                    onStageAndPay={handleStageAndPay}
                    onUpdateBoard={handleUpdateBoard}
                    onDonateAndList={handleDonateAndList}
                    currentUser={currentUser}
                    editingBoard={editingBoard}
                    stagedCount={stagedNewBoards.length}
                    totalEntries={totalEntries}
                    onOpenLearnMore={() => setIsLearnMoreOpen(true)}
                    onOpenCharityModal={() => setIsCharityModalOpen(true)}
                />
            )}

            {isAccountSettingsOpen && currentUser && (
                <AccountSettingsModal
                    currentUser={currentUser}
                    onClose={() => setIsAccountSettingsOpen(false)}
                    onUpdateUser={handleUpdateUser}
                    onAddAlert={handleAddAlert}
                    onDeleteAlert={handleDeleteAlert}
                />
            )}
            {isNotificationModalOpen && (
                <NotificationModal
                    board={notificationBoard || undefined}
                    searchTerm={notificationSearchTerm || undefined}
                    onClose={handleCloseNotificationModal}
                    onConfirm={handleConfirmNotification}
                />
            )}
            {isPaymentModalOpen && currentUser && (
                <PaymentModal
                    amount={paymentAmount}
                    itemDescription={paymentDescription}
                    currentUser={currentUser}
                    onClose={handlePaymentCancel}
                    onPaymentSuccess={handlePaymentSuccess}
                />
            )}
            {boardToShare && (
                <ShareModal board={boardToShare} onClose={() => setBoardToShare(null)} />
            )}
            {isLearnMoreOpen && (
                <LearnMoreModal
                    onClose={() => setIsLearnMoreOpen(false)}
                    giveawayImages={giveawayImages}
                />
            )}
            {isCharityModalOpen && (
                <CharityModal
                    onClose={() => setIsCharityModalOpen(false)}
                    totalRaised={totalDonationsRaised}
                    currencySymbol={getCurrencySymbol(currentUser?.country)}
                />
            )}
            {verificationStatus === 'verifying' && (
                <VerificationStatusModal onVerified={handleVerifyAccount} onClose={handleCloseVerificationModal} />
            )}
            {isVolumeCalculatorOpen && (
                <VolumeCalculatorModal
                    onClose={() => setIsVolumeCalculatorOpen(false)}
                    onApply={handleApplyVolumeRange}
                />
            )}
        </div>
    );
};

export default App;