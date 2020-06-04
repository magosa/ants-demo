# ants-demo

"ants-demo" is a program for continuity test of human flow sensing system

# Requirement

* Python 3.6.5

Environments under [Anaconda for Windows](https://www.anaconda.com/distribution/) is teste

* node.js 12.16.2

Environments under [Node.js for Windows](https://nodejs.org/ja/) is teste

# Installation

* Construction of dummy sensor environment.
Install required libraries with pip command.

```bash
pip install -r ~/pypackage.txt
```

* Construction of dashboard environment.
Install required libraries with npm command.

```bash
cd ~/ants-demo
npm install
```

# Usage

* sample_maker.py

"sample_maker.py" creates dummy data of the sensor in the current directory with the name "test.csv".

Run "sample_maker.py"

```bash
python sample_maker.py
```

* current_sender.py

"current_sender.py" sends the sensor data of the specified file to "router.js" every 0.2 seconds.

The file must be specified with the full path.

Run "current_sender.py"

```bash
python current_sender.py C:\Users\magosa\Desktop\ants-demo\test.csv
```

* router.js

"router.js" receives sensor data in real time using web socket and routes to API server.

"router.js" uses port 8080 when using web sockets.

Run "router.js"

```bash
node router.js
```

* app.js

"app.js" is a web server for displaying the dashboard.

Receive the routed sensor data from "router.js" and visualize the flow of people in real time.

![](https://github.com/magosa/ants-demo.git/data/img/sample.gif)

Run "app.js"

```bash
node app.js
```

After starting "app.js", accessing "localhost:8000" from the web browser will display the dashboard.

# Noter

I don't test environments under Linux and Mac.

# Author

* magosa



Thank you!
