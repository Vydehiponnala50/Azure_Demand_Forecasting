# Guide: Adding GitHub Secrets for Deployment

Since I cannot access your GitHub repository settings directly, you must manually add the following "Secrets" to your repository to reach **100% Deployment**.

## Step 1: Access GitHub Secrets
1. Go to your repository on GitHub.
2. Click on **Settings** (tab at the top).
3. In the left sidebar, click **Secrets and variables** > **Actions**.
4. Click **New repository secret**.

## Step 2: Add Docker Hub Secrets
You need these two secrets for the Docker build step to push your image:

| Secret Name | Value |
| :--- | :--- |
| `DOCKER_HUB_USERNAME` | Your Docker Hub ID (e.g. `vydehidev`) |
| `DOCKER_HUB_TOKEN` | Your Docker Hub Access Token (not your password) |

> [!TIP]
> To get a token, go to [Docker Hub Settings](https://hub.docker.com/settings/security) and click **Create new access token**.

## Step 3: Add Azure Credentials (Optional but Recommended)
If you are deploying to **Azure Container Apps** (as configured in the workflow):

| Secret Name | Value |
| :--- | :--- |
| `AZURE_CREDENTIALS` | The JSON output from the `az ad sp create-for-rbac` command. |

### How to get Azure Credentials:
Run this in your terminal (using Azure CLI):
```bash
az ad sp create-for-rbac --name "AzureMLOpsCI" --role contributor --scopes /subscriptions/{your-subscription-id} --sdk-auth
```
Copy the entire JSON output and paste it as the value for `AZURE_CREDENTIALS`.

---

## What happens after you add these?
1. **Push your code**: `git commit -m "Activate Production Pipeline" && git push origin main`.
2. **Auto-Deployment**: GitHub Actions will now:
   - Build your Docker image.
   - **Log in** to Docker Hub using your secrets.
   - **Push** the image to your repository.
   - **Deploy** the latest model and code to Azure.
