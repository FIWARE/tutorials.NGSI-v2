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
<a href="https://www.fiware.org/global-summit/"><img src="https://fiware.github.io//catalogue/img/Summit25.png" width="240" height="70" /></a> &nbsp; <a href="https://www.eventbrite.co.uk/e/fiware-global-summit-2025-rabat-smart-city-morocco-tickets-1249129843989"><img src="https://fiware.github.io//catalogue/img/Training25.png" width="240" height="70" /></a> 
-->

<blockquote>
<h3>Should I use NGSI-v2 or NGSI-LD?</h3>
<p>
    FIWARE offers two flavours of the NGSI interfaces:
</p>
<ul>
    <li>
        <b style="color:#777;">NGSI-v2</b> offers JSON based interoperability used in individual Smart Systems
    </li>
    <li>
        <b style="color:#777;">NGSI-LD</b> offers JSON-LD based interoperability used for Federations and Data Spaces
    </li>
</ul>
<p>
    NGSI-v2 is ideal for creating individual applications offering interoperable interfaces for web services
    or IoT devices. It is easier to understand than NGSI-LD and does not require a JSON-LD
    <code style="color:#777;">@context</code>.
</p>
<p>
    However, NGSI-LD and Linked Data is necessary when creating a data space or introducing a system of
    systems aproach, and in situations requiring  interoperability across apps and organisations.
</p>
<p>
     More information about NGSI-LD can be found <a href="https://ngsi-ld-tutorials.readthedocs.io/">here</a>
</p>
</blockquote>

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

The NGSI-v2 tutorials are designed to run under any Unix environment, the tested configuration and
[GitPod](https://github.com/gitpod-io/gitpod) environment is currently based on Ubuntu 22.04.2 LTS. However, there may
be some minor issues when running the tutorials directly on Windows machines or Apple M1 Silicon `amd64` systems, and
the following [Virtual Box set-up](virtual-box.md) or [WSL set-up](wsl.md) can be used when facing issues.

### Docker and Docker Compose <img src="https://www.docker.com/favicon.ico" align="left"  height="30" width="30" style="border-right-style:solid; border-right-width:10px; border-color:transparent; background: transparent">

To keep things simple all components will be run using [Docker](https://www.docker.com). **Docker** is a container
technology which allows to different components isolated into their respective environments.

-   To install Docker on Windows follow the instructions [here](https://docs.docker.com/docker-for-windows/).
-   To install Docker on Mac/OS follow the instructions [here](https://docs.docker.com/docker-for-mac/).
-   To install Docker on Unix follow the instructions [here](./docker-ubuntu.md).

### Postman <img src="./img/postman.png" align="left"  height="25" width="35" style="border-right-style:solid; border-right-width:10px; border-color:transparent; background: transparent">

The tutorials which use HTTP requests supply a collection for use with the Postman utility. Postman is a testing
framework for REST APIs. The tool can be downloaded from [www.getpostman.com](https://www.getpostman.com). All the
FIWARE Postman collections can be downloaded directly from the
[Postman API network](https://explore.postman.com/team/3mM5EY6ChBYp9D).

### GitPod <img src="https://gitpod.io/favicon.ico" align="left"  height="30" width="30">

[Gitpod](https://github.com/gitpod-io/gitpod) is an open-source Kubernetes application for ready-to-code cloud
development environments that spins up an automated dev environment for each task, in the cloud. It enables you to run
the tutorials in a cloud development environment directly from your browser or your Desktop IDE. The default environment
is based on Ubuntu and includes Java `11.0.16` and Maven `3.8.6`.

### Apache Maven <img src="https://maven.apache.org/favicon.ico" align="left"  height="30" width="30" style="border-right-style:solid; border-right-width:10px; border-color:transparent; background: transparent">

[Apache Maven](https://maven.apache.org/download.cgi) is a software project management and comprehension tool. Based on
the concept of a project object model (POM), Maven can manage a project's build, reporting and documentation from a
central piece of information. Maven can be used to define and download our dependencies and to build and package Java or
Scala code into a JAR file. Apache Maven `3.8.6` or higher is recommended.

### JQ <img src="https://jqlang.github.io/jq/jq.png" align="left"  height="30" width="30" style="border-right-style:solid; border-right-width:10px; border-color:transparent; background: transparent">

[jq](https://jqlang.github.io/jq/) is a lightweight and flexible command-line JSON processor which can be used to format
the JSON responses received from the context broker and other FIWARE components. More information about how to use jq
can be found [here](https://www.digitalocean.com/community/tutorials/how-to-transform-json-data-with-jq). `jq-1.6` is
recommended.

### Windows Subsystem for Linux

We will start up our services using a simple bash script. Windows users should download the
[Windows Subsystem for Linux](https://learn.microsoft.com/en-us/windows/wsl/install) to provide a command-line
functionality similar to a Linux distribution on Windows.

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
