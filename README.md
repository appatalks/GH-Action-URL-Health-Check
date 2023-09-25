# URL Health Check GitHub Action

This GitHub Action monitors the health of a specified URL and takes automated actions if the health check fails. It performs the following tasks:

1. Checks the specified URL to see if it's reachable and returns a status code.
2. Captures a screenshot of the URL when the health check fails.
3. Creates a GitHub issue with information about the failed URL, status code, and a link to the captured screenshot.

## Usage

### As a reusable workflow

```yml
name: URL Health Cheack
on:
  workflow_dispatch:
    inputs:
      url:
        description: 'URL to check'
        required: false
        default: 'https://example.com'
jobs:
  url_to_check:
     uses: appatalks/GH-Action-URL-Health-Check/.github/workflows/healthcheck.yml@main
     with:
       url: ${{ inputs.url }}
```

### Clone and Roll your own

To use this GitHub Action, follow these steps:

1. **Add the Workflow File**

   Create a `.github/workflows/healthcheck.yml` file in your repository with the following content:

   You can copy the example workflow file from the [GitHub repository here](https://github.com/appatalks/GH-Action-URL-Health-Check/blob/main/.github/workflows/healthcheck.yml). 

   Make sure to configure the URL you want to check by editing the `default` value or providing it when manually triggering the workflow.

2. **Add the healthcheck.js File**

   Copy the healthcheck.js file to the root of your repository, or modify the yml file accordingly for a new path.    

3. **Run the Workflow**

   Trigger the workflow manually via the GitHub Actions UI or set up a schedule for it to run periodically.

5. **Review Results**

   If the health check fails (returns a status code other than 200), the workflow will:

   - Capture a screenshot of the URL.
   - Create a GitHub issue with details about the failure, including the status code and screenshot of the URL.

   You can then investigate and resolve the issue accordingly.

That's it! You now have an automated URL health monitoring system in place using GitHub Actions.
