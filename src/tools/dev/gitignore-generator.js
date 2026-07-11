import { showToast } from "../../components/toast.js";
import { copyToClipboard } from "../../utils/clipboard.js";
import { downloadBlob } from "../../utils/file.js";
import { escapeHtml } from "../../utils/escape-html.js";

export const toolConfig = {
  id: "gitignore-generator",
  name: "Gitignore Generator",
  category: "dev",
  description:
    "Generate .gitignore files by selecting languages, frameworks, build tools, IDEs, and operating systems. Includes ready-made presets and custom-line support.",
  icon: "🙈",
  accept: null,
  maxSizeMB: null,
  keywords: ["gitignore", "git", "ignore", "template", "project", "preset", "repository"],
  steps: [
    "Pick a preset (Web, Python, Java, Mobile, C++) or browse categories",
    "Toggle individual templates on or off from the categorized grid",
    "Optionally type custom lines to append (project-specific paths, etc.)",
    "Copy the result to your clipboard or download a .gitignore file"
  ],
  faqs: [
    {
      question: "What is a .gitignore file?",
      answer:
        "A .gitignore file tells Git which files and folders to ignore in a project. It prevents build artifacts, dependencies, secrets, and OS-generated files from being committed."
    },
    {
      question: "Where do I put the .gitignore file?",
      answer:
        "Place it in the root of your repository. Git applies its rules recursively to every folder below it."
    },
    {
      question: "Can I save my own combinations?",
      answer:
        'Yes. Use the "Save current" input to store your selection as a named preset in your browser. It will be available the next time you open this tool.'
    },
    {
      question: "Are the templates from gitignore.io?",
      answer:
        "No. This tool ships a curated set of bundled templates written for common project types. They cover most everyday needs without a network request."
    }
  ]
};

export const CATEGORIES = [
  { id: "languages", name: "Languages", icon: "💻" },
  { id: "frameworks", name: "Frameworks", icon: "🧩" },
  { id: "build", name: "Build & Tooling", icon: "🛠️" },
  { id: "ide", name: "IDEs & Editors", icon: "📝" },
  { id: "os", name: "Operating Systems", icon: "🖥️" }
];

export const TEMPLATES = {
  node: {
    name: "Node",
    category: "languages",
    content: `# Node
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
.npm
.yarn-integrity
coverage/
.nyc_output
`
  },
  python: {
    name: "Python",
    category: "languages",
    content: `# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
develop-eggs/
dist/
build/
*.egg-info/
.eggs/
.installed.cfg
*.egg
.pytest_cache/
.coverage
htmlcov/
.tox/
.venv/
venv/
env/
ENV/
.mypy_cache/
.ruff_cache/
`
  },
  java: {
    name: "Java",
    category: "languages",
    content: `# Java
*.class
*.log
hs_err_pid*
replay_pid*
.gradle/
build/
out/
target/
*.war
*.nar
*.ear
*.zip
*.tar.gz
.jar
*.hprof
`
  },
  go: {
    name: "Go",
    category: "languages",
    content: `# Go
# Binaries
*.exe
*.exe~
*.dll
*.dylib
*.so
*.test
*.out

# Go workspace
go.work
go.work.sum

# Dependency directories
vendor/

# Test binary, built with \`go test -c\`
*.test

# Coverage profile
*.cover
coverage.txt
`
  },
  rust: {
    name: "Rust",
    category: "languages",
    content: `# Rust
/target/
/Cargo.lock

# These are backup files
*.rs.bk

# MSVC
*.pdb
`
  },
  c: {
    name: "C",
    category: "languages",
    content: `# C
# Prerequisites
*.d

# Object files
*.o
*.ko
*.obj
*.elf

# Linker output
*.ilk
*.map
*.exp

# Precompiled Headers
*.gch
*.pch

# Libraries
*.lib
*.a
*.la
*.lo

# Shared objects
*.so
*.so.*
*.dylib

# Executables
*.exe
*.out
*.app
`
  },
  cpp: {
    name: "C++",
    category: "languages",
    content: `# C++
# Prerequisites
*.d

# Compiled Object files
*.slo
*.lo
*.o
*.obj

# Precompiled Headers
*.gch
*.pch

# Compiled Dynamic libraries
*.so
*.dylib
*.dll

# Fortran module files
*.mod
*.smod

# Compiled Static libraries
*.lai
*.la
*.a
*.lib

# Executables
*.exe
*.out
*.app
`
  },
  csharp: {
    name: "C#",
    category: "languages",
    content: `# C#
# Build results
[Dd]ebug/
[Rr]elease/
x64/
x86/
[Aa][Rr][Mm]/
[Aa][Rr][Mm]64/
bld/
[Bb]in[Oo]bj/
[Ll]og/
[Ll]ogs/

# Visual Studio
.vs/
*.userprefs

# .NET Core
project.lock.json
project.fragment.lock.json
artifacts/
**/AppPackages/
**/BundleArtifacts/
`
  },
  ruby: {
    name: "Ruby",
    category: "languages",
    content: `# Ruby
*.gem
*.rbc
/.config
/coverage/
/InstalledFiles
/pkg/
/spec/reports/
/spec/examples.txt
/test/tmp/
/test/version_tmp/
/tmp/

# Bundler
.bundle/
vendor/bundle/

# RubyGems
.ruby-gem-cache
`
  },
  php: {
    name: "PHP",
    category: "languages",
    content: `# PHP
/vendor/
/node_modules/
/composer.phar

# Local config
.env
.env.*
!.env.example

# IDE
.idea/
.vscode/

# Logs
*.log

# OS
.DS_Store
Thumbs.db
`
  },
  swift: {
    name: "Swift",
    category: "languages",
    content: `# Swift
# Xcode
build/
DerivedData/
*.xcodeproj/
*.xcworkspace/
xcuserdata/
*.xcuserstate
*.xcscheme
*.moved-aside
*.pbxuser
!default.pbxuser
*.mode1v3
!default.mode1v3
*.mode2v3
!default.mode2v3
*.perspectivev3
!default.perspectivev3
`
  },
  kotlin: {
    name: "Kotlin",
    category: "languages",
    content: `# Kotlin
.gradle/
build/
!gradle/wrapper/gradle-wrapper.jar
!**/src/main/**/build/
!**/src/test/**/build/

# IDE
.idea/
*.iml
*.iws
*.ipr
out/

# OS
.DS_Store
`
  },
  scala: {
    name: "Scala",
    category: "languages",
    content: `# Scala
*.class
*.log
target/
build/
.bsp/
.idea/
.metals/
project/target/
project/project/
`
  },
  perl: {
    name: "Perl",
    category: "languages",
    content: `# Perl
!Makefile
Makefile
blib/
inc/
Build
*.pm.tdy
_build/
cover_db/
pm_to_blib
%canon
%cflags
%config
%draft
%emacs
%install
%iusepackage
%ldflags
%license
%make
%mymeta
%packlist
%pm
%pod
%readme
%syms
%t
%todo
%w
%wim
.idea/
`
  },
  r: {
    name: "R",
    category: "languages",
    content: `# R
# History
.Rapp.history
.Rhistory
.Ruserdata

# Session
.RData
.Ruserdata

# RStudio
.Rproj.user/
*.Rproj

# Code
*-.o
*.so

# Output
*.csv
*.tsv
*.rds
*.rda
`
  },
  lua: {
    name: "Lua",
    category: "languages",
    content: `# Lua
*.luac
*.rock
.luarocks/
luacov.luac
luacov.report.out
luacov.stats.out
`
  },
  elixir: {
    name: "Elixir",
    category: "languages",
    content: `# Elixir
/_build/
/cover/
/deps/
/doc/
/.fetch
erl_crash.dump
*.ez
*.beam
/config/*.secret.exs
.elixir_ls/
`
  },
  haskell: {
    name: "Haskell",
    category: "languages",
    content: `# Haskell
dist/
dist-newstyle/
.stack-work/
.cabal-sandbox/
cabal.sandbox.config
*.hi
*.o
*.dyn_hi
*.dyn_o
.ghc.environment.*
.hpc/
`
  },
  dart: {
    name: "Dart / Flutter",
    category: "languages",
    content: `# Dart / Flutter
.dart_tool/
.flutter-plugins
.flutter-plugins-dependencies
.packages
.pub-cache/
.pub/
build/
**/generated_plugin_registrant.dart
**/GeneratedPluginRegistrant.*
.idea/
*.iml
`
  },
  typescript: {
    name: "TypeScript",
    category: "languages",
    content: `# TypeScript
*.tsbuildinfo
*.js
*.js.map
!src/**/*.js
!lib/**/*.js
!dist/**/*.js

# Dependencies
node_modules/

# Build output
dist/
build/
out/
`
  },
  javascript: {
    name: "JavaScript",
    category: "languages",
    content: `# JavaScript
node_modules/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.env
.env.local
.env.*.local
dist/
build/
coverage/
`
  },
  html: {
    name: "HTML",
    category: "languages",
    content: `# HTML
*.html.tmp
node_modules/
dist/
build/
.DS_Store
`
  },
  css: {
    name: "CSS",
    category: "languages",
    content: `# CSS
*.css.map
*.min.css
!*.min.css
node_modules/
.sass-cache/
.csslintcache
`
  },
  scss: {
    name: "SCSS",
    category: "languages",
    content: `# SCSS
.sass-cache/
*.css.map
*.scss.map
`
  },
  sass: {
    name: "Sass",
    category: "languages",
    content: `# Sass
.sass-cache/
*.css.map
`
  },
  less: {
    name: "Less",
    category: "languages",
    content: `# Less
*.less.cache
node_modules/
`
  },
  graphql: {
    name: "GraphQL",
    category: "languages",
    content: `# GraphQL
.graphql/
**/__generated__/
`
  },
  solidity: {
    name: "Solidity",
    category: "languages",
    content: `# Solidity
node_modules/
.artifacts/
.cache/
typechain-types/
build/
coverage/
coverage.json
openzeppelin/
`
  },
  ocaml: {
    name: "OCaml",
    category: "languages",
    content: `# OCaml
_build/
*.cm[ai]
*.cmxa
*.cmo
*.cma
*.o
*.obj
`
  },
  erlang: {
    name: "Erlang",
    category: "languages",
    content: `# Erlang
*.beam
*.o
*.so
ebin/
deps/
.rel
`
  },
  zig: {
    name: "Zig",
    category: "languages",
    content: `# Zig
.zig-cache/
zig-out/
`
  },
  nim: {
    name: "Nim",
    category: "languages",
    content: `# Nim
nimcache/
nimblecache/
*.pdb
`
  },
  julia: {
    name: "Julia",
    category: "languages",
    content: `# Julia
*.jl.cov
*.jl.*.cov
*.jl.mem
Manifest.toml
`
  },

  react: {
    name: "React",
    category: "frameworks",
    content: `# React
/build
/coverage
/.next
/out
node_modules/
.DS_Store
*.log
.env.local
.env.development.local
.env.test.local
.env.production.local
`
  },
  vue: {
    name: "Vue",
    category: "frameworks",
    content: `# Vue
.DS_Store
node_modules/
/dist

# Local env files
.env.local
.env.*.local

# Log files
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Editor directories and files
.idea
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
`
  },
  angular: {
    name: "Angular",
    category: "frameworks",
    content: `# Angular
/angular
/.angular
/node_modules
/dist
/tmp
/out-tsc
/bazel-out

# IDEs and editors
.idea/
.vscode/
.project
.classpath
.c9/
*.launch
.settings/
*.sublime-workspace

# Misc
/connect.lock
/coverage
/libpeerconnection.log
npm-debug.log
yarn-error.log
testem.log
/typings

# System files
.DS_Store
Thumbs.db
`
  },
  svelte: {
    name: "Svelte",
    category: "frameworks",
    content: `# Svelte
node_modules/
/build
/.svelte-kit
/package
.env
.env.*
!.env.example
vite.config.js.timestamp-*
vite.config.ts.timestamp-*
`
  },
  next: {
    name: "Next.js",
    category: "frameworks",
    content: `# Next.js
/.next/
/out/
/build
node_modules/
.DS_Store
*.pem
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.vercel
*.tsbuildinfo
next-env.d.ts
`
  },
  nuxt: {
    name: "Nuxt",
    category: "frameworks",
    content: `# Nuxt
.nuxt
.output
.nitro
.cache
dist

# Node dependencies
node_modules

# Logs
logs
*.log

# Misc
.DS_Store
.fleet
.idea

# Local env files
.env
.env.*
!.env.example
`
  },
  remix: {
    name: "Remix",
    category: "frameworks",
    content: `# Remix
.cache/
/build/
/public/build
node_modules
/.env

# Lockfiles
package-lock.json
yarn.lock
pnpm-lock.yaml

# IDE
.idea/
.vscode/
`
  },
  gatsby: {
    name: "Gatsby",
    category: "frameworks",
    content: `# Gatsby
.cache/
public
node_modules/
.env*
!.env.example
`
  },
  astro: {
    name: "Astro",
    category: "frameworks",
    content: `# Astro
dist/
.astro/
node_modules/

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
`
  },
  laravel: {
    name: "Laravel",
    category: "frameworks",
    content: `# Laravel
/node_modules
/public/hot
/public/storage
/storage/*.key
/vendor
.env
.env.backup
.env.production
.phpactor.json
.phpunit.result.cache
Homestead.json
Homestead.yaml
auth.json
npm-debug.log
yarn-error.log
/.idea
/.vscode
`
  },
  django: {
    name: "Django",
    category: "frameworks",
    content: `# Django
*.log
*.pot
*.pyc
__pycache__/
local_settings.py
db.sqlite3
db.sqlite3-journal
migrations/
media/
staticfiles/
.env
.venv/
venv/
`
  },
  rails: {
    name: "Rails",
    category: "frameworks",
    content: `# Rails
*.rbc
*.sassc
/.config
/coverage/
/InstalledFiles
/pkg/
/spec/reports/
/spec/examples.txt
/test/tmp/
/test/version_tmp/
/tmp/

# Bundler
.bundle
vendor/bundle

# Rails
log/*
tmp/*
!log/.keep
!tmp/.keep

# Local config
.env*
!.env.example
`
  },
  spring: {
    name: "Spring",
    category: "frameworks",
    content: `# Spring
HELP.md
target/
!.mvn/wrapper/maven-wrapper.jar
!**/src/main/**/target/
!**/src/test/**/target/

# IDE
.idea/
*.iws
*.iml
*.ipr
.vscode/
.classpath
.project
.settings/
.loadpath

# OS
.DS_Store
Thumbs.db
`
  },
  flask: {
    name: "Flask",
    category: "frameworks",
    content: `# Flask
instance/
*.pyc
__pycache__/
.env
.venv/
venv/
ENV/
.coverage
htmlcov/
.pytest_cache/
.mypy_cache/
`
  },
  express: {
    name: "Express",
    category: "frameworks",
    content: `# Express
node_modules/
*.log
.env
.env.local
.DS_Store
coverage/
dist/
`
  },
  fastapi: {
    name: "FastAPI",
    category: "frameworks",
    content: `# FastAPI
__pycache__/
*.py[cod]
*$py.class
.venv/
venv/
ENV/
.env
.env.local
.pytest_cache/
.coverage
htmlcov/
.mypy_cache/
.ruff_cache/
dist/
build/
*.egg-info/
`
  },
  nest: {
    name: "NestJS",
    category: "frameworks",
    content: `# NestJS
node_modules/
dist/
coverage/
.nyc_output
.env
.env.local
*.log
.DS_Store
`
  },
  symfony: {
    name: "Symfony",
    category: "frameworks",
    content: `# Symfony
/var/
/vendor/
/node_modules/
/public/bundles/

# Local config
.env
.env.local
.env.*.local

# IDE
.idea/
.vscode/
`
  },
  flutter: {
    name: "Flutter",
    category: "frameworks",
    content: `# Flutter
.dart_tool/
.flutter-plugins
.flutter-plugins-dependencies
.packages
.pub-cache/
.pub/
build/
**/generated_plugin_registrant.dart
**/GeneratedPluginRegistrant.*
.idea/
*.iml
ios/Pods/
ios/.symlinks/
ios/Flutter/Flutter.framework
ios/Flutter/Flutter.podspec
`
  },
  "react-native": {
    name: "React Native",
    category: "frameworks",
    content: `# React Native
/ios/Pods/
/android/.gradle
/android/app/build/
/android/build/
/ios/build/
*.xcworkspace
*.xcuserstate
**/build/
**/.cxx/
node_modules/
/.metro-cache/
`
  },
  electron: {
    name: "Electron",
    category: "frameworks",
    content: `# Electron
node_modules/
dist/
out/
release/
*.log
.DS_Store
.env
.env.local
.vscode/
.idea/
`
  },
  tauri: {
    name: "Tauri",
    category: "frameworks",
    content: `# Tauri
# Generated by Cargo
/target/
**/target/

# Generated by Tauri
**/gen/schemas

# Dependencies
node_modules/

# Logs
*.log
`
  },
  unity: {
    name: "Unity",
    category: "frameworks",
    content: `# Unity
/[Ll]ibrary/
/[Tt]emp/
/[Oo]bj/
/[Bb]uild/
/[Bb]uilds/
/[Ll]ogs/
/[Uu]ser[Ss]ettings/
/MemoryCaptures/

# Asset meta data should only be ignored when the corresponding asset is also ignored
!/[Aa]ssets/**/*.meta

# Uncomment this line if you wish to ignore the asset store tools plugin
# /[Aa]ssets/AssetStoreTools*

# Autogenerated Jetbrains Rider plugin
/[Aa]ssets/Plugins/Editor/JetBrains*

# Visual Studio cache directory
.vs/
`
  },
  godot: {
    name: "Godot",
    category: "frameworks",
    content: `# Godot
.import/
export.cfg
export_presets.cfg

# Imported translations
*.translation

# Mono-specific ignores
.mono/
data_*/

# Godot-specific ignores
.godot/
`
  },
  dotnet: {
    name: ".NET",
    category: "frameworks",
    content: `# .NET
bin/
obj/
out/
packages/
*.user
*.suo
.vs/
.idea/
*.nupkg
*.snupkg
project.lock.json
project.fragment.lock.json
artifacts/
`
  },
  phoenix: {
    name: "Phoenix",
    category: "frameworks",
    content: `# Phoenix
/_build/
/cover/
/deps/
/doc/
/.fetch
erl_crash.dump
*.ez
*.beam
/config/*.secret.exs
.elixir_ls/

# Generated assets
/assets/node_modules/
/priv/static/assets/
/priv/static/cache_manifest.json
`
  },

  npm: {
    name: "npm",
    category: "build",
    content: `# npm
node_modules/
npm-debug.log*
.npm
.npmrc
package-lock.json.bak
`
  },
  yarn: {
    name: "Yarn",
    category: "build",
    content: `# Yarn
.yarn-integrity
.yarn/cache
.yarn/build-state.yml
.yarn/install-state.gz
.pnp.*
node_modules/
`
  },
  pnpm: {
    name: "pnpm",
    category: "build",
    content: `# pnpm
node_modules/
.pnpm-store/
.pnpm-debug.log*
`
  },
  bun: {
    name: "Bun",
    category: "build",
    content: `# Bun
node_modules/
bun.lockb
bun.lock
`
  },
  webpack: {
    name: "Webpack",
    category: "build",
    content: `# Webpack
/node_modules/
/dist/
/build/
.cache/
webpack.stats.json
`
  },
  vite: {
    name: "Vite",
    category: "build",
    content: `# Vite
node_modules/
dist/
dist-ssr/
*.local
.vite/

# Editor
.vscode/*
!.vscode/extensions.json
.idea/
`
  },
  parcel: {
    name: "Parcel",
    category: "build",
    content: `# Parcel
.parcel-cache/
dist/
build/
`
  },
  turbo: {
    name: "Turborepo",
    category: "build",
    content: `# Turborepo
.turbo/
node_modules/
dist/
build/
`
  },
  gradle: {
    name: "Gradle",
    category: "build",
    content: `# Gradle
.gradle/
build/
!gradle/wrapper/gradle-wrapper.jar
!**/src/main/**/build/
!**/src/test/**/build/

# IDE
.idea/
*.iml
`
  },
  maven: {
    name: "Maven",
    category: "build",
    content: `# Maven
target/
pom.xml.tag
pom.xml.releaseBackup
pom.xml.versionsBackup
pom.xml.next
release.properties
dependency-reduced-pom.xml
buildNumber.properties
.mvn/timing.properties
.mvn/wrapper/maven-wrapper.jar
`
  },
  cargo: {
    name: "Cargo (Rust)",
    category: "build",
    content: `# Cargo
/target/
Cargo.lock

# These are backup files
*.rs.bk
`
  },
  cmake: {
    name: "CMake",
    category: "build",
    content: `# CMake
CMakeCache.txt
CMakeFiles/
CMakeScripts/
Testing/
Makefile
cmake_install.cmake
install_manifest.txt
compile_commands.json
CTestTestfile.cmake
_deps/

# External projects
build/
`
  },
  make: {
    name: "Make",
    category: "build",
    content: `# Make
*.o
*.obj
*.exe
*.out
*.a
*.so
*.dll

# Make-specific
*.d
*.dep
`
  },
  bazel: {
    name: "Bazel",
    category: "build",
    content: `# Bazel
/bazel-*
/bazel-out
/bazel-bin
/bazel-testlogs
/bazel-server
`
  },
  esbuild: {
    name: "esbuild",
    category: "build",
    content: `# esbuild
node_modules/
dist/
build/
*.esbuild.cache
`
  },

  vscode: {
    name: "VS Code",
    category: "ide",
    content: `# VS Code
.vscode/*
!.vscode/settings.json
!.vscode/tasks.json
!.vscode/launch.json
!.vscode/extensions.json
*.code-workspace
`
  },
  intellij: {
    name: "IntelliJ IDEA",
    category: "ide",
    content: `# IntelliJ IDEA
.idea/
*.iws
*.iml
*.ipr
out/
!/.idea/misc.xml
!/.idea/codeStyles
!/.idea/inspectionProfiles
`
  },
  eclipse: {
    name: "Eclipse",
    category: "ide",
    content: `# Eclipse
.metadata
bin/
tmp/
*.tmp
*.bak
*.swp
*~.nib
local.properties
.settings/
.loadpath
.recommenders
`
  },
  vim: {
    name: "Vim",
    category: "ide",
    content: `# Vim
*.sw[a-p]
.*.sw[a-p]
*~

# Session
.session
.sessions

# Temporary
.netrwhist
*~
`
  },
  sublime: {
    name: "Sublime Text",
    category: "ide",
    content: `# Sublime Text
*.sublime-project
*.sublime-workspace
`
  },
  atom: {
    name: "Atom",
    category: "ide",
    content: `# Atom
.atom/
`
  },
  jetbrains: {
    name: "JetBrains (All)",
    category: "ide",
    content: `# JetBrains IDEs (IntelliJ, PyCharm, WebStorm, etc.)
.idea/
*.iml
*.ipr
*.iws
`
  },
  xcode: {
    name: "Xcode",
    category: "ide",
    content: `# Xcode
build/
DerivedData/
*.xcodeproj/
!*.xcodeproj/project.pbxproj
*.xcworkspace/
xcuserdata/
*.xcuserstate
*.moved-aside
`
  },
  "android-studio": {
    name: "Android Studio",
    category: "ide",
    content: `# Android Studio
.gradle/
local.properties
.idea/
*.iml
.DS_Store
build/
captures/
.externalNativeBuild/
.cxx/
`
  },
  netbeans: {
    name: "NetBeans",
    category: "ide",
    content: `# NetBeans
nbproject/private/
nbbuild/
dist/
nbdist/
.nb-gradle/
`
  },
  pycharm: {
    name: "PyCharm",
    category: "ide",
    content: `# PyCharm
.idea/
*.iml
*.iws
/out/
`
  },
  jupyter: {
    name: "Jupyter",
    category: "ide",
    content: `# Jupyter
.ipynb_checkpoints/
profile_default/
ipython_config.py
`
  },

  windows: {
    name: "Windows",
    category: "os",
    content: `# Windows
Thumbs.db
Thumbs.db:encryptable
ehthumbs.db
ehthumbs_vista.db
*.stackdump
[Dd]esktop.ini
$RECYCLE.BIN/
*.lnk
`
  },
  macos: {
    name: "macOS",
    category: "os",
    content: `# macOS
.DS_Store
.AppleDouble
.LSOverride
Icon
._*
.DocumentRevisions-V100
.fseventsd
.Spotlight-V100
.TemporaryItems
.Trashes
.VolumeIcon.icns
.com.apple.timemachine.donotpresent
`
  },
  linux: {
    name: "Linux",
    category: "os",
    content: `# Linux
*~
.fuse_hidden*
.Trash-*
.nfs*

# KDE
.directory

# Thumbnails
.~lock.*
`
  },
  "ds-store": {
    name: ".DS_Store (Cross-platform)",
    category: "os",
    content: `# .DS_Store
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db
`
  },
  "thumbs-db": {
    name: "Thumbs.db (Cross-platform)",
    category: "os",
    content: `# Thumbs.db
Thumbs.db
Thumbs.db:encryptable
ehthumbs.db
ehthumbs_vista.db
`
  }
};

export const PRESETS = [
  {
    name: "Web (Node + React)",
    keys: [
      "node",
      "javascript",
      "react",
      "npm",
      "vite",
      "webpack",
      "vscode",
      "macos",
      "windows",
      "linux",
      "ds-store"
    ]
  },
  {
    name: "Python (Data / Web)",
    keys: [
      "python",
      "flask",
      "fastapi",
      "django",
      "pycharm",
      "vscode",
      "jupyter",
      "macos",
      "windows",
      "linux",
      "ds-store"
    ]
  },
  {
    name: "Java / JVM",
    keys: [
      "java",
      "kotlin",
      "scala",
      "gradle",
      "maven",
      "intellij",
      "eclipse",
      "vscode",
      "macos",
      "windows",
      "ds-store"
    ]
  },
  {
    name: "Mobile (iOS + Android)",
    keys: [
      "swift",
      "kotlin",
      "flutter",
      "react-native",
      "xcode",
      "android-studio",
      "vscode",
      "macos",
      "windows",
      "ds-store"
    ]
  },
  {
    name: "C++ / Systems",
    keys: [
      "c",
      "cpp",
      "cmake",
      "make",
      "cargo",
      "vscode",
      "intellij",
      "macos",
      "windows",
      "linux",
      "ds-store"
    ]
  }
];

export function buildGitignore(selectedKeys, customLines, templates = TEMPLATES) {
  const date = new Date().toISOString().split("T")[0];
  let out = `# Generated by ToolBox Gitignore Generator\n# ${date}\n\n`;

  const validKeys = (selectedKeys || []).filter(k => templates[k]);
  if (validKeys.length === 0 && !(customLines && customLines.trim())) {
    return "";
  }

  validKeys.forEach((key, idx) => {
    const t = templates[key];
    out += t.content.trimEnd();
    if (idx < validKeys.length - 1 || (customLines && customLines.trim())) {
      out += "\n\n";
    }
  });

  if (customLines && customLines.trim()) {
    out += `# Custom\n${customLines.trim()}\n`;
  }

  return out;
}

const GITIGNORE_USER_PRESETS_KEY = "gitignore-generator:user-presets";

export function loadUserPresets() {
  try {
    const raw = localStorage.getItem(GITIGNORE_USER_PRESETS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveUserPresets(list) {
  try {
    localStorage.setItem(GITIGNORE_USER_PRESETS_KEY, JSON.stringify(list));
  } catch {
    showToast({ message: "Could not save preset (storage unavailable)", type: "error" });
  }
}

function renderPresetDropdown(presetEl) {
  const user = loadUserPresets();
  let html = '<option value="">— select a preset —</option><optgroup label="Built-in">';
  PRESETS.forEach((p, i) => {
    html += `<option value="builtin:${i}">${escapeHtml(p.name)}</option>`;
  });
  html += "</optgroup>";
  if (user.length) {
    html += '<optgroup label="My presets">';
    user.forEach((p, i) => {
      html += `<option value="user:${i}">${escapeHtml(p.name)} (delete)</option>`;
    });
    html += "</optgroup>";
  }
  presetEl.innerHTML = html;
}

function renderCategorySection(cat, selected, collapsed) {
  const items = Object.entries(TEMPLATES).filter(([, t]) => t.category === cat.id);
  const isCollapsed = !!collapsed[cat.id];
  return `
    <div class="gig-cat" data-cat="${cat.id}" style="background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-md);margin-bottom:var(--space-3);">
      <button class="gig-cat-toggle" data-cat="${cat.id}" type="button" style="width:100%;display:flex;justify-content:space-between;align-items:center;padding:var(--space-3) var(--space-4);background:transparent;border:none;cursor:pointer;font-size:var(--text-base);font-weight:600;color:var(--color-text);">
        <span>${cat.icon} ${cat.name} <span style="color:var(--color-text-muted);font-weight:400;font-size:var(--text-sm);">(${items.length})</span></span>
        <span class="gig-cat-arrow" style="transition:transform 0.2s;${isCollapsed ? "" : "transform:rotate(90deg);"}">▸</span>
      </button>
      <div class="gig-cat-body" data-cat="${cat.id}" style="display:${isCollapsed ? "none" : "grid"};grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:var(--space-2);padding:0 var(--space-4) var(--space-4);">
        ${items
          .map(
            ([key, t]) => `
          <label class="gig-tpl" data-key="${key}" data-name="${t.name.toLowerCase()}" style="display:flex;align-items:center;gap:var(--space-2);padding:var(--space-2) var(--space-3);border:1px solid var(--color-border);border-radius:var(--radius-md);cursor:pointer;font-size:var(--text-sm);user-select:none;background:var(--color-bg);">
            <input type="checkbox" class="gig-tpl-cb" data-key="${key}" ${selected.has(key) ? "checked" : ""} style="width:16px;height:16px;cursor:pointer;accent-color:var(--color-primary);">
            <span>${escapeHtml(t.name)}</span>
          </label>
        `
          )
          .join("")}
      </div>
    </div>
  `;
}

function renderChips(selected, chipsEl, countEl) {
  if (selected.size === 0) {
    chipsEl.innerHTML =
      '<span style="color:var(--color-text-muted);font-size:var(--text-sm);">No templates selected yet. Pick a preset or toggle one below.</span>';
  } else {
    chipsEl.innerHTML = Array.from(selected)
      .map(key => {
        const t = TEMPLATES[key];
        return t
          ? `<span class="gig-chip" data-key="${key}" style="display:inline-flex;align-items:center;gap:var(--space-1);padding:var(--space-1) var(--space-2);background:var(--color-primary);color:white;border-radius:var(--radius-md);font-size:var(--text-sm);cursor:pointer;" title="Click to remove">${escapeHtml(t.name)} <span style="opacity:0.8;">×</span></span>`
          : "";
      })
      .join("");
  }
  countEl.textContent = selected.size;
}

function bindGitignoreEvents(ctx) {
  const {
    container,
    state,
    searchEl,
    chipsEl,
    categoriesEl,
    customEl,
    outputEl,
    presetEl,
    presetNameEl,
    saveBtn,
    clearBtn,
    copyBtn,
    downloadBtn,
    renderAll,
    showToast,
    copyToClipboard,
    downloadBlob
  } = ctx;

  presetEl.addEventListener("change", () => {
    const v = presetEl.value;
    if (!v) return;
    if (v.startsWith("builtin:")) {
      const p = PRESETS[parseInt(v.slice(8), 10)];
      if (p) {
        state.selected = new Set(p.keys.filter(k => TEMPLATES[k]));
        renderAll();
        showToast({ message: `Applied preset: ${p.name}`, type: "success" });
      }
    } else if (v.startsWith("user:")) {
      const user = loadUserPresets();
      const p = user[parseInt(v.slice(5), 10)];
      if (p) {
        state.selected = new Set(p.keys.filter(k => TEMPLATES[k]));
        renderAll();
        showToast({ message: `Loaded preset: ${p.name}`, type: "success" });
      }
      if (confirm(`Delete user preset "${p?.name || ""}"?`)) {
        user.splice(parseInt(v.slice(5), 10), 1);
        saveUserPresets(user);
        renderPresetDropdown(presetEl);
        showToast({ message: "Preset deleted", type: "success" });
      } else {
        renderPresetDropdown(presetEl);
      }
    }
  });

  saveBtn.addEventListener("click", () => {
    const name = presetNameEl.value.trim();
    if (!name) {
      showToast({ message: "Enter a name for the preset", type: "error" });
      return;
    }
    if (state.selected.size === 0) {
      showToast({ message: "Select at least one template first", type: "error" });
      return;
    }
    const user = loadUserPresets();
    if (user.some(p => p.name.toLowerCase() === name.toLowerCase())) {
      showToast({ message: "A preset with that name already exists", type: "error" });
      return;
    }
    user.push({ name, keys: Array.from(state.selected) });
    saveUserPresets(user);
    renderPresetDropdown(presetEl);
    presetNameEl.value = "";
    showToast({ message: `Saved preset "${name}"`, type: "success" });
  });

  clearBtn.addEventListener("click", () => {
    state.selected.clear();
    renderAll();
  });
  searchEl.addEventListener("input", () => {
    const q = searchEl.value.trim().toLowerCase();
    container.querySelectorAll(".gig-tpl").forEach(el => {
      el.style.display = q === "" || el.dataset.name.includes(q) ? "" : "none";
    });
    container.querySelectorAll(".gig-cat").forEach(catEl => {
      catEl.style.display = Array.from(catEl.querySelectorAll(".gig-tpl")).some(
        el => el.style.display !== "none"
      )
        ? ""
        : "none";
    });
  });
  customEl.addEventListener("input", () => {
    state.custom = customEl.value;
    ctx.renderOutput();
  });

  categoriesEl.addEventListener("change", e => {
    const cb = e.target.closest(".gig-tpl-cb");
    if (!cb) return;
    if (cb.checked) state.selected.add(cb.dataset.key);
    else state.selected.delete(cb.dataset.key);
    renderAll();
  });

  categoriesEl.addEventListener("click", e => {
    const toggle = e.target.closest(".gig-cat-toggle");
    if (!toggle) return;
    const catId = toggle.dataset.cat;
    state.collapsed[catId] = !state.collapsed[catId];
    const body = container.querySelector(`.gig-cat-body[data-cat="${catId}"]`);
    const arrow = toggle.querySelector(".gig-cat-arrow");
    body.style.display = state.collapsed[catId] ? "none" : "grid";
    arrow.style.transform = state.collapsed[catId] ? "" : "rotate(90deg)";
  });

  chipsEl.addEventListener("click", e => {
    const chip = e.target.closest(".gig-chip");
    if (!chip) return;
    state.selected.delete(chip.dataset.key);
    renderAll();
  });

  copyBtn.addEventListener("click", async () => {
    const text = outputEl.textContent;
    if (!text || text.startsWith("Select templates")) {
      showToast({ message: "Nothing to copy yet", type: "error" });
      return;
    }
    const ok = await copyToClipboard(text);
    showToast({
      message: ok ? "Copied .gitignore to clipboard" : "Copy failed",
      type: ok ? "success" : "error"
    });
  });

  downloadBtn.addEventListener("click", () => {
    const text = outputEl.textContent;
    if (!text || text.startsWith("Select templates")) {
      showToast({ message: "Nothing to download yet", type: "error" });
      return;
    }
    downloadBlob(new Blob([text], { type: "text/plain" }), ".gitignore");
    showToast({ message: "Downloaded .gitignore", type: "success" });
  });
}

export function render(container) {
  const state = { selected: new Set(), custom: "", collapsed: {} };

  container.innerHTML = `
    <div class="tool-layout">
      <div style="background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-md);padding:var(--space-4);margin-bottom:var(--space-4);">
        <div style="display:flex;flex-wrap:wrap;gap:var(--space-3);align-items:flex-end;">
          <div style="flex:1;min-width:200px;"><label for="gig-preset" style="font-size:var(--text-sm);font-weight:600;color:var(--color-text-muted);display:block;margin-bottom:var(--space-2);">Preset</label><select id="gig-preset" class="text-input"></select></div>
          <button class="btn btn-secondary btn-sm" id="gig-clear" type="button">Clear selection</button>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:var(--space-2);margin-top:var(--space-3);align-items:flex-end;">
          <div style="flex:1;min-width:180px;"><label for="gig-preset-name" style="font-size:var(--text-sm);font-weight:600;color:var(--color-text-muted);display:block;margin-bottom:var(--space-2);">Save current selection as</label><input type="text" id="gig-preset-name" class="text-input" placeholder="e.g. my-monorepo" maxlength="40"></div>
          <button class="btn btn-secondary btn-sm" id="gig-save-preset" type="button">Save preset</button>
        </div>
      </div>
      <div style="margin-bottom:var(--space-3);"><input type="search" id="gig-search" class="text-input" placeholder="Search templates (node, react, vscode, macos, ...)" autocomplete="off"></div>
      <div style="margin-bottom:var(--space-4);">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-2);"><span style="font-weight:600;font-size:var(--text-sm);color:var(--color-text-muted);">Selected (<span id="gig-count">0</span>)</span><span style="font-size:var(--text-xs);color:var(--color-text-muted);">Click a chip to remove</span></div>
        <div id="gig-chips" style="display:flex;flex-wrap:wrap;gap:var(--space-2);min-height:32px;padding:var(--space-2);background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-md);"></div>
      </div>
      <div id="gig-categories" style="margin-bottom:var(--space-4);"></div>
      <div style="margin-bottom:var(--space-4);"><label for="gig-custom" style="font-weight:600;font-size:var(--text-sm);color:var(--color-text-muted);display:block;margin-bottom:var(--space-2);">Custom lines (optional)</label><textarea id="gig-custom" class="text-input" rows="3" placeholder="Add your own patterns, one per line&#10;e.g.&#10;secrets/&#10;*.local&#10;.env.production" style="font-family:monospace;font-size:var(--text-sm);resize:vertical;"></textarea></div>
      <div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-2);"><span style="font-weight:600;font-size:var(--text-sm);color:var(--color-text-muted);">Generated .gitignore</span><div style="display:flex;gap:var(--space-2);"><button class="btn btn-secondary btn-sm" id="gig-copy" type="button">Copy</button><button class="btn btn-primary btn-sm" id="gig-download" type="button">Download .gitignore</button></div></div>
        <pre id="gig-output" style="background:#1e1e2e;color:#cdd6f4;padding:var(--space-3);border-radius:var(--radius-md);overflow-x:auto;font-size:var(--text-sm);line-height:1.6;white-space:pre-wrap;word-break:break-word;min-height:160px;font-family:monospace;max-height:480px;overflow-y:auto;"></pre>
      </div>
    </div>
  `;

  const q = id => container.querySelector(`#${id}`);
  const els = {
    searchEl: q("gig-search"),
    chipsEl: q("gig-chips"),
    countEl: q("gig-count"),
    categoriesEl: q("gig-categories"),
    customEl: q("gig-custom"),
    outputEl: q("gig-output"),
    presetEl: q("gig-preset"),
    presetNameEl: q("gig-preset-name"),
    saveBtn: q("gig-save-preset"),
    clearBtn: q("gig-clear"),
    copyBtn: q("gig-copy"),
    downloadBtn: q("gig-download")
  };

  function renderOutput() {
    els.outputEl.textContent =
      buildGitignore(Array.from(state.selected), state.custom) ||
      "Select templates above (or type custom lines) to build your .gitignore.";
  }

  function syncCheckboxes() {
    container.querySelectorAll(".gig-tpl-cb").forEach(cb => {
      cb.checked = state.selected.has(cb.dataset.key);
    });
  }

  function renderAll() {
    renderChips(state.selected, els.chipsEl, els.countEl);
    els.categoriesEl.innerHTML = CATEGORIES.map(cat =>
      renderCategorySection(cat, state.selected, state.collapsed)
    ).join("");
    syncCheckboxes();
    renderOutput();
  }

  bindGitignoreEvents({
    container,
    state,
    ...els,
    renderAll,
    syncCheckboxes,
    renderOutput,
    showToast,
    copyToClipboard,
    downloadBlob
  });

  renderPresetDropdown(els.presetEl);
  renderAll();
}

export function destroy() {}
