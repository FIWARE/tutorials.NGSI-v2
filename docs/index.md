# <span style='color:#5dc0cf'>NGSI-v2</span> Step-by-Step

[![Documentation](https://nexus.lab.fiware.org/repository/raw/public/badges/chapters/documentation.svg)](https://fiware-tutorials.rtfd.io)
[![NGSI v2](https://img.shields.io/badge/NGSI-v2-5dc0cf.svg)](https://fiware-ges.github.io/orion/api/v2/stable/)
[![Support badge](https://img.shields.io/badge/tag-fiware-orange.svg?logo=stackoverflow)](https://stackoverflow.com/questions/tagged/fiware)

<div id="social-meta">
<meta property="og:title" content="A collection of NGSI-v2 tutorials for the FIWARE system">
<meta property="og:description" content="Each tutorial consists of a series of exercises to demonstrate the correct use of individual FIWARE components.">
<meta property="og:type" content="documentation">
<meta property="og:url" content="https://fiware-tutorials.readthedocs.io/en/latest/">
<meta property="og:image" content="https://www.fiware.org/wp-content/uploads/FF_Banner_General.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@FIWARE">
<meta name="twitter:title" content="About
The process for commercial software to apply as powered by FIWARE or FIWARE-Ready">
<meta name="twitter:description" content="A series of exercises to demonstrate the correct use of individual FIWARE component.">
<meta name="twitter:image" content="https://www.fiware.org/wp-content/uploads/FF_Banner_General.png">
</div>

This is a collection of **NGSI-v2** tutorials for the FIWARE system. Each tutorial consists of a series of exercises to
demonstrate the correct use of individual FIWARE components and shows the flow of context data within a simple Smart
Solution either by connecting to a series of dummy IoT devices or manipulating the context directly or programmatically.

<!--- GLOBAL SUMMIT BANNER AD
<a href="https://www.fiware.org/global-summit/"><img src="https://fiware.github.io//catalogue/img/Summit23.png" width="240" height="70" /></a>  <a href="https://www.eventbrite.com/e/fiware-on-site-training-tickets-591474775977"><img src="https://fiware.github.io//catalogue/img/Training23.png" width="240" height="70" /></a> 
--->

<h3>How to Use</h3>

Each tutorial is a self-contained learning exercise designed to teach the developer about a single aspect of FIWARE. A
summary of the goal of the tutorial can be found in the description at the head of each page. Every tutorial is
associated with a GitHub repository holding the configuration files needed to run the examples. Most of the tutorials
build upon concepts or enablers described in previous exercises the to create a complex smart solution which is
_"powered by FIWARE"_.

The tutorials are split according to the chapters defined within the
[FIWARE catalog](https://www.fiware.org/developers/catalogue/) and are numbered in order of difficulty within each
chapter hence an introduction to a given enabler will occur before the full capabilities of that element are explored in
more depth.

It is recommended to start with reading the full **Core Context Management: The NGSI-v2 Interface** Chapter before
moving on to other subjects, as this will give you a fuller understanding of the role of context data in general.
However, it is not necessary to follow all the subsequent tutorials sequentially - as FIWARE is a modular system, you
can choose which enablers are of interest to you.

## Prerequisites

The NGSI-v2 tutorials are designed to run under any Unix environment, the tested
configuration and [GitPod](https://github.com/gitpod-io/gitpod) environment is currently based on Ubuntu 22.04.2 LTS.
However, there may be some minor issues when running the tutorials directly on Windows or Apple M1 Silicon `amd64` systems, and the following set-up can be used when facing issues.


### Tested Windows configuration

Windows and Mac are able to emulate a Unix system when running [VirtualBox](https://www.virtualbox.org/) - the following minimal set-up is recommended:

-  VirtualBox
-  Ubuntu 22.04.2 2G RAM 25G Disk
-  Docker Engine on Ubuntu: Docker 24.0.4 and Docker compose 2.19.1

Download Virtualbox from [here](https://www.virtualbox.org/)

#### Ubuntu

Download Ubuntu LTS from [here](https://ubuntu.com/download/desktop)

To set up the working environment, follow these steps: 
-  Open Virtualbox and create a new virtual machine.
-  Select the ISO image downloaded earlier (.iso file).
-  Choose a username and a password. Check the "Guest Additions" option (to enable features such as shared clipboard and shared folders).
-  Set the memory size to 2GB and allocate 2 CPUs.
-  Create a virtual hard disk with a size of 25GB.
-  Finish the setup process and start the virtual machine.

If you encounter the error _"Username is not in the sudoers file. This incident will be reported"_ when attempting to execute a `sudo` command, follow these steps to resolve the issue:

- Restart your virtual machine. While restaring, press the Shift key for a few seconds to get the Grub boot menu.
- Using the Down Arrow, select "Advanced options for Ubuntu" and press Enter.
- Select the kernel with the "recovery mode" option and press Enter to open the Recovery menu.
- In the "Recovery menu", move over to the line "root Drop to root shell prompt", then press Enter.
- Use the root password and press Enter to start the "maintenance mode".
- At this point, you should be at the root shell prompt. Change the system to be mounted as read/write by running the command: "mount -o rw,remount /"
- Execute the following command to add the user to the sudo group: "adduser username sudo" (use the actual username on the system).
- Type the exit command to go back to the "Recovery menu": "Exit"
- Use the Right Arrow to select `<Ok>` and press Enter.
- Press `<Ok>` to continue with normal boot sequence.

### Docker and Docker Compose <img src="https://www.docker.com/favicon.ico" align="left"  height="30" width="30" style="border-right-style:solid; border-right-width:10px; border-color:transparent; background: transparent">

To keep things simple all components will be run using [Docker](https://www.docker.com). **Docker** is a container
technology which allows to different components isolated into their respective environments.

-   To install Docker on Windows follow the instructions [here](https://docs.docker.com/docker-for-windows/).
-   To install Docker on Mac follow the instructions [here](https://docs.docker.com/docker-for-mac/).

#### install Docker Engine on Ubuntu

Follow the instructions in this [link](https://docs.docker.com/engine/install/ubuntu/#install-using-the-repository) to install Docker using the apt repository.

**Docker Compose** is a tool for defining and running multi-container Docker applications. A series of `*.yaml` files
are used configure the required services for the application. This means all container services can be brought up in a
single command.

You can check your current **Docker** and **Docker Compose** versions using the following commands:

```bash
docker-compose -v
docker version
```

> **Important** In recent versions, `docker-compose` is already included as part of of the main `docker` client, Please
> ensure that you are using Docker version 24.0.4 or higher and Docker Compose 2.29.1 or higher and upgrade if necessary.
> If you are unable to upgrade and stuck using an older version you can still run the tutorials by adding a `legacy`
> parameter at the end the `./services` script commands e.g. `services start legacy`

If using a Linux distro with an outdated docker-compose, the files can be installed directly as shown:

```bash
sudo curl -L "https://github.com/docker/compose/releases/download/1.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

If you are using docker-compose in Ubuntu with VMWare and faced the following error: _ERROR: Couldn't connect to Docker
daemon at http+docker://localunixsocket - is it running?_

It can be solved by owning the `/var/run/docker.sock` Unix socket as shown:

```bash
sudo chown $USER /var/run/docker.sock
```

### Postman <img src="./img/postman.png" align="left"  height="25" width="35" style="border-right-style:solid; border-right-width:10px; border-color:transparent; background: transparent">

The tutorials which use HTTP requests supply a collection for use with the Postman utility. Postman is a testing
framework for REST APIs. The tool can be downloaded from [www.getpostman.com](https://www.getpostman.com). All the
FIWARE Postman collections can be downloaded directly from the
[Postman API network](https://explore.postman.com/team/3mM5EY6ChBYp9D).

### GitPod <img src="https://gitpod.io/favicon.ico" align="left"  height="30" width="30">

[Gitpod](https://github.com/gitpod-io/gitpod) is an open-source Kubernetes application for ready-to-code cloud
development environments that spins up an automated dev environment for each task, in the cloud. It enables you to run
the tutorials in a cloud development environment directly from your browser or your Desktop IDE.

### Apache Maven <img src="https://maven.apache.org/favicon.ico" align="left"  height="30" width="30" style="border-right-style:solid; border-right-width:10px; border-color:transparent; background: transparent">

[Apache Maven](https://maven.apache.org/download.cgi) is a software project management and comprehension tool. Based on
the concept of a project object model (POM), Maven can manage a project's build, reporting and documentation from a
central piece of information. Maven can be used to define and download our dependencies and to build and package Java or
Scala code into a JAR file.

### JQ <img src="https://jqlang.github.io/jq/jq.png" align="left"  height="30" width="30" style="border-right-style:solid; border-right-width:10px; border-color:transparent; background: transparent">

[jq](https://jqlang.github.io/jq/) is a lightweight and flexible command-line JSON processor which can be used
to format the JSON responses received from the context broker and other FIWARE components. More information about how to use jq can be found [here](https://www.digitalocean.com/community/tutorials/how-to-transform-json-data-with-jq)

## Data models

The following NGSI-v2 and NGSI-LD Data models are used within the tutorials:

-   <img src="https://json-ld.org/favicon.ico" align="center" height="30" width="30" style="border-right-style:solid; border-right-width:10px; border-color:transparent; background: transparent">
    [Tutorial-specific Data Models](https://fiware.github.io/tutorials.Step-by-Step/schema/)
-   <img src="https://json-ld.org/favicon.ico" align="center" height="30" width="30" style="border-right-style:solid; border-right-width:10px; border-color:transparent; background: transparent">
    [Smart Data Models](https://smartdatamodels.org)

## List of Tutorials

<h3 style="box-shadow: 0px 4px 0px 0px #233c68;">Core Context Management: The NGSI-v2 Interface</h3>

These first tutorials are an introduction to the FIWARE Context Broker, and are an essential first step when learning to
use FIWARE.

&nbsp; 101. [Getting Started](getting-started.md)<br/> &nbsp; 102. [Entity Relationships](entity-relationships.md)<br/>
&nbsp; 103. [CRUD Operations](crud-operations.md)<br/> &nbsp; 104. [Context Providers](context-providers.md)<br/>
&nbsp; 105. [Altering the Context Programmatically](accessing-context.md)<br/> &nbsp; 106.
[Subscribing to Changes in Context](subscriptions.md)<br/>

<h3 style="box-shadow: 0px 4px 0px 0px #5dc0cf;">Internet of Things, Robots and third-party systems</h3>

In order to make a context-based system aware of the state of the real world, it will need to access information from
Robots, IoT Sensors or other suppliers of context data such as social media. It is also possible to generate commands
from the context broker to alter the state of real-world objects themselves.

&nbsp; 201. [Introduction to IoT Sensors](iot-sensors.md)<br/> &nbsp; 202.
[Provisioning an IoT Agent](iot-agent.md)<br/> &nbsp; 203. [IoT over MQTT](iot-over-mqtt.md)<br/> &nbsp; 204.
[Using an alternative IoT Agent](iot-agent-json.md)<br/> &nbsp; 205.
[Creating a Custom IoT Agent](custom-iot-agent.md)<br/> &nbsp; 206. [IoT over IOTA Tangle](iot-over-iota-tangle.md)<br/>

<!-- &nbsp; 250. [Introduction to Fast-RTPS and Micro-RTPS](fast-rtps-micro-rtps.md)<br/> -->

<h3 style="box-shadow: 0px 4px 0px 0px #233c68;">Core Context Management: History Management</h3>

These tutorials show how to manipulate and store context data therefore it can be used for further processing.

&nbsp; 301. [Persisting Context Data using Apache Flume (MongoDB, MySQL, PostgreSQL)](historic-context-flume.md)<br/>
&nbsp; 302. [Persisting Context Data using Apache NIFI (MongoDB, MySQL, PostgreSQL)](historic-context-nifi.md)<br/>
&nbsp; 303. [Querying Time Series Data (MongoDB)](short-term-history.md)<br/> &nbsp; 304.
[Querying Time Series Data (Crate-DB)](time-series-data.md)<br/> &nbsp; 305.
[Big Data Analysis (Flink)](big-data-flink.md)<br/> &nbsp; 306. [Big Data Analysis (Spark)](big-data-spark.md)<br/>

<h3 style="box-shadow: 0px 4px 0px 0px #ff7059;">Security: Identity Management</h3>

These tutorials show how to create and administer users within an application, and how to restrict access to assets, by
assigning roles and permissions.

&nbsp; 401. [Administrating Users and Organizations](identity-management.md)<br/> &nbsp; 402.
[Managing Roles and Permissions](roles-permissions.md)<br/> &nbsp; 403.
[Securing Application Access](securing-access.md)<br/> &nbsp; 404.
[Securing Microservices with a PEP Proxy](pep-proxy.md)<br/> &nbsp; 405.
[XACML Rules-based Permissions](xacml-access-rules.md)<br/> &nbsp; 406.
[Administrating XACML via a PAP](administrating-xacml.md)<br/> &nbsp; 407.
[Authenticating Identities (OpenID)](open-id-connect.md)<br/>

<h3 style="box-shadow: 0px 4px 0px 0px #88a1ce;">Processing, Analysis and Visualization</h3>

These tutorials show how to create, process, analyze or visualize context information.

&nbsp; 501. [Creating Application Mashups](application-mashups.md)<br/> &nbsp; 503.
[Introduction to Media Streams](media-streams.md)<br/> &nbsp; 507. [Cloud-Edge Computing](edge-computing.md)<br/>

<h3 style="box-shadow: 0px 4px 0px 0px #233c68;">NGSI-LD for NGSI-v2 Developers</h3>

These tutorials show how to use NGSI-LD which combines context data management with linked data concepts.

&nbsp; 601. [Introduction to Linked Data](linked-data.md)<br/> &nbsp; 602.
[Linked Data Relationships and Data Models](relationships-linked-data.md)<br/> &nbsp; 603.
[Traversing Linked Data](working-with-linked-data.md)<br/> &nbsp; 604.
[Linked Data Subscriptions and Registrations](ld-subscriptions-registrations.md)<br/>
