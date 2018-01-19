# upk
[![npm version](https://badge.fury.io/js/upk.svg)](https://badge.fury.io/js/upk)

A simple, opened, decentralized package manager for Unity3D

# Features

upk is developed to manage assets for Unity3D development.  

# Installation
It can be installed from[npm](https://www.npmjs.com/)
```bash
$ npm i -g upk
```

# Usage
Firstly, you have to create `Upkfile` on the root directory of your Unity project.

And then, exec command as follows:

```bash
$ upk install --verbose

```

# Upkfile

Upkfile is the list of dependencies. It's like this: 
```Upkfile
dependencies [
  git "keroxp/UniCommon", "^0.0.7"
  git "neuecc/UniRx", null,
    include: [
      src: "Assets/Plugins/*", dest: "Assets/"
    ]
  upk "SDUnity-Chan", "http://unity-chan.com/download/download.php?id=SDUnityChan&v=1.01"
  upk "Unity-Chan-Toon-Shader", -> zip "http://unity-chan.com/download/download.php?id=UTS2_0&v=2.0.3"
  upk "SocialConnector", -> git "anchan828/social-connector"
]
```

The file looks like DSL but is actually pure [CoffeeScript](https://coffeescript.org) file.

## git (urlLike: string, semver?: string, opts?)
`git` is the resolver for remote git repository. 
It will clone repository into `UpkModules` folder and then copy specified files into `Assets` folder. 

Any valid git can be accepped for `urlLike` 1st argument. If repository exists on Github, `:user/:repo` style also can be accepted.

`semver` for second argument is semantic version range for package. 

`opts` is optional argument that describe which file should be copied into `Assets` folder.

##### include: {src: string, dest: string}[]


##### exclude: string[]

 
 ## upk (assetName: string, resolver: string | () => Promise\<string\>)
`upk` is the resolver for remote `unitypackage` file. 
Downloading upk file, extract assets into specified location that are described in `unitypackage` file.

`assetName` is used for identifier of the asset and for directory name of package.

`resolver` is url-like string or resolver function of upk file.

If url-like string was given, then download file from the url and extract it directory.
If any `async` function that returns `Promise<string>` was given, then extract assets from the promised file or directory.    

You can pass `zip` and `git` resolver by default. Both will promise resolved resouce directory by downloading remote files.

`upk` resolver search for `.unitypackage` file in resolved path. If resolved path is a file, then check it whether has `.unitypackage` extension. 
If is a directory, it search by glob `{,*/}*.unitypackage` pattern. That will find file in the root directory and its all first subdirecties.

Extraction of `unitypackage` file will be done by its own way. Just like opening it with `Unity` application, all asset files will be located into `Assets` folder. 

## asset(name: string, resolver: string | () => Promise<string>, opts)

`asset` resolver copy specified file. Except for there are no version control, it has almost same feature with `git`. 

## zip(urlLike: string, pathResolver?: () => string)

`zip` resolver will download zip file and extract it into module directory.  
Execution of this resolver is not permitted 
on the root context. This can only be passed for 2nd argument of `zip` and `asset` resolver. `zip` itself just download and extract zip file.

`pathResolver` is optional argument. It determines root directory of extracted files. By default, extracted directory will be used.

# Known Issues

This package is still pre-release beta version.
There may be bugs and limitation.

# LICENSE
MIT   