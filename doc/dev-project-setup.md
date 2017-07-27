##Setting up a Development Project with QNut
When setting up a Qnut development project, use this tsconfig.json configuraton:

```javascript
{
  "compilerOptions": {
    "removeComments": true,
    "preserveConstEnums": true,
    "inlineSourceMap": true
  },
  "include"  : [
    "qnut.root/wp-content/plugins/peanut/pnut/packages/**/*",
    "qnut.root/application/**/*"
  ],
  "exclude": [
    "qnut.root/wp-content/plugins/peanut/pnut/packages/qnut/**/*"
  ]
}
```
