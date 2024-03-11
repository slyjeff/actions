# update-linear-status
Updates the status of all linear issues for a PR

## Requirements
* Must grant the following Github permissions
  * pull-requests: read
  * contents: read
* Must supply the following inputs
  * owner
  * repo
  * pr_number
  * github_token
  * github_token
  * status
    * note: this status must be setup in Linear on a per team basis
  * liner_api_key
    * [Create Here](https://linear.app/prizepicks/settings/api)

## Example to update status when merging to uat or main 
This example will update the status of all branches merged into staging or main, assuming they have been named with the
links provided by Linear 

In this example, items merged into to staging will be set to a status of "In Staging", those merged into master
will be set to "In Prod". As noted above, these statuses must be set up in Linear for this to work.
```
name: Update Status of Linear Issues

on:
  pull_request:
    types:
      - closed
    branches:
      - 'staging'
      - 'master'

jobs:
  update-linear-status:
    permissions:
      pull-requests: read
      contents: read
    runs-on: ubuntu-latest
    name: Updates Linear status of issues merged into staging
    steps:
      - name: Update Linear Status
        if: github.event.pull_request.merged == true
        uses: slyjeff/Update-Linear-Status@main
        with:
          owner: ${{ github.repository_owner }}
          repo: ${{ github.event.repository.name }}
          pr_number: ${{ github.event.number }}
          github_token: ${{ secrets.GITHUB_TOKEN }}
          status: "${{ env.BRANCH == 'staging' && 'In Staging' || 'In Prod' }}"
          linear_api_key: ${{ secrets.LINEAR_API_KEY }}

```