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

### Plugin

* [autoprefixer](https://www.npmjs.com/package/autoprefixer)
* [normalize.css](https://necolas.github.io/normalize.css/)


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

Create Project:
```sh
$ gulp p -c projectname
```

Create Template:
```sh
$ gulp t -c templatename
```

Test and Watch Template:
```sh
$ gulp d -w templatename
```


### Build Project

Build and Watch Template:
```sh
$ gulp b -w templatetname
```

Build All:
```sh
$ gulp b
```

### Development Tree

    +-- files
        +-- project_name
            +-- css
                +-- views
                    +-- maps
                        +-- template_name.css.map
                    +-- template_name.css
            +-- img
                +-- favicon
					+-- browserconfig
					+-- apple-touch-icon
					+-- favicon
					+-- tile
					+-- tile-wide
            +-- js
                +-- initialize.js
                +-- vendor
                    +-- onready.js
                +-- views
                    +-- template_name.js
            +-- sass
                +-- initialize.scss
                +-- vendor
				    +-- normalize.js
                +-- views
                    +-- template_name.scss
            +-- Views
                +-- project_name
                    +-- inc
                    +-- template_name.html
					

### Production Tree

    +-- dist
        +-- files
            +-- project_name
                +-- img
                    +-- favicon
                +-- js
                    +-- views
                        +-- template_name.js
        +-- Views
            +-- project_name
                +-- template_name.html
				
				
### Reference
*	http://isobar-idev.github.io/code-standards/
* 	http://www.initializr.com/
*	https://github.com/audreyr/favicon-cheat-sheet