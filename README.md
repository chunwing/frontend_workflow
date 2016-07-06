# frontflow

Provide a front-end web development workflow with 
Isobar Front-end Code Standards. http://isobar-idev.github.io/code-standards/

  - Front-end Develop workflow standardization
  - Provide Front-end code Best Practices
  - Provide quick start Front-end boilerplate

You can also:
  - Extend the Front-end boilerplate
  - Modify the Workflow and Best Practices 
  - Update the file structure

### Version
0.0.1

### Tech

* [node.js] - evented I/O for the backend
* [Gulp] - the streaming build system
* [browserify](http://browserify.org/) - require('modules') in the browser by bundling up dependencies.
* [jQuery] - duh


### Installation

frontflow requires [Node.js](https://nodejs.org/) v4+ to run.

You need Gulp installed globally:

```sh
$ npm i -g gulp
```

```sh
$ svn co https://svn.isobar.hk/svn/isobar_developers/trunk/web/frontflow
$ cd frontflow
$ npm i
```

### Development

Want to contribute? Great!

Dillinger uses Gulp + Browserify for fast developing.
Make a change in your file and instantanously see your updates!

Open your favorite Terminal and run these commands.

First Tab:
```sh
$ gulp p -c projectname
```

Second Tab:
```sh
$ gulp t -c templatename
```

Test and Watch Template:
```sh
$ gulp d -w templatename
```


### Build Project

Build and Watch Single:
```sh
$ gulp b -w projectname
```

Build All:
```sh
$ gulp b
```



### Develop Tree

frontflow
+-- files
|  +-- project_name
│      +-- css
│      │  	+-- views
│      │        +-- maps
│      │        │   +-- template_name.css.map
│      │        +-- template_name.css
│      +-- img
│      │   +-- favicon
│      +-- js
│      |   +-- initialize.js
│      │   +-- vendor
│      │   │  +-- onready.js
│      │   +-- views
│      │      +-- template_name.js
│      +-- sass
│          +-- initialize.scss
│          +-- vendor
│          +-- views
│              +-- template_name.scss
+-- Views
    +-- project_name
        +-- inc
        +-- template_name.html

### Production Tree

frontflow
+-- dist
    +-- files
    |   +-- project_name
    │       +-- img
    │       │   +-- favicon
    │       +-- js
    │           +-- views
    │               +-- template_name.js
    +-- Views
       +-- project_name
           +-- template_name.html
