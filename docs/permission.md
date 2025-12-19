# Deployment Permission Request

**Subject:** Action Required: Grant Permissions for Backend Deployment

Hi,

I am currently unable to deploy the backend Cloud Functions due to a missing permission (`ActAs` Service Account). Even with Editor access, Google Cloud requires an explicit role to allow deploying code that runs on the server.

Please follow these steps to grant the necessary permission:

1.  **Open the Google Cloud IAM Console**:
    [https://console.cloud.google.com/iam-admin/iam?project=gen-lang-client-0093965307](https://console.cloud.google.com/iam-admin/iam?project=gen-lang-client-0093965307)
    *(Ensure the project "gen-lang-client-0093965307" is selected at the top)*

2.  **Locate my account**:
    Find `luqman.haider01@gmail.com` in the list of principals.

3.  **Edit Permissions**:
    Click the **Edit (pencil icon)** button next to my email.

4.  **Add Role**:
    *   Click **+ ADD ANOTHER ROLE**
    *   Search for and select: **Service Account User**
    *   Click **Save**

Alternatively, upgrading my role to **Owner** will also resolve this immediately.

Thanks.
