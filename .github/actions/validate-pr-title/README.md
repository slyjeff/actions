# validate-pr-title
Validates that a PR title conforms to PrizePicks [semantic naming](https://www.notion.so/2d01e7766c0842dba3f656de78e0d0d7?v=fa0f5ae35e9c4f6a83d556b3dfd3df5d&p=8d5b812361ca4c2c9606f0b214987b36&pm=s)

## Example 
```
  update-linear-status:
    runs-on: ubuntu-latest
    name: Validate PR Name
    steps:
      - name: Validate PR Title
        uses: slyjeff/actions/validate-pr-title@main
```