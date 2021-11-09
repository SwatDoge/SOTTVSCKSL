# eslint-plugin-eslint-snake-case

This plugin verifys variable names are in snake_case

## Installation

You'll first need to install [ESLint](http://eslint.org):

```
$ npm i eslint --save-dev
```

Next, install `eslint-plugin-eslint-snake-case`:

```
$ npm install eslint-plugin-eslint-snake-case --save-dev
```

**Note:** If you installed ESLint globally (using the `-g` flag) then you must also install `eslint-plugin-eslint-snake-case` globally.

## Usage

Add `eslint-snake-case` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
    "plugins": [
        "eslint-snake-case"
    ]
}
```


Then configure the rules you want to use under the rules section.

```json
{
    "rules": {
        "eslint-snake-case/rule-name": 2
    }
}
```

## Supported Rules

* snake-case





