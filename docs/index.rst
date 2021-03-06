.. MAAS documentation master file

########################
MAAS: Metal As A Service
########################

This is the documentation for the `MAAS project`_.

Metal as a Service -- MAAS -- lets you treat physical servers like
virtual machines in the cloud. Rather than having to manage each
server individually, MAAS turns your bare metal into an elastic
cloud-like resource.

What does that mean in practice? Tell MAAS about the machines you want
it to manage and it will boot them, check the hardware's okay, and
have them waiting for when you need them. You can then pull nodes up,
tear them down and redeploy them at will; just as you can with virtual
machines in the cloud.

When you're ready to deploy a service, MAAS gives `Juju`_ the nodes it
needs to power that service. It's as simple as that: no need to
manually provision, check and, afterwards, clean-up. As your needs
change, you can easily scale services up or down. Need more power for
your Hadoop cluster for a few hours? Simply tear down one of your Nova
compute nodes and redeploy it to Hadoop. When you're done, it's just
as easy to give the node back to Nova.

.. _MAAS project: http://maas.io/
.. _Juju: https://juju.ubuntu.com/

MAAS is ideal where you want the flexibility of the cloud, and the
hassle-free power of Juju charms, but you need to deploy to bare
metal.

************
Introduction
************

.. toctree::
   :maxdepth: 2

   releases
   changelog


***********************
API / CLI Documentation
***********************

.. toctree::
   :maxdepth: 2

   api
   api_authentication
   maascli
   version


******************
Command-line Tools
******************

.. toctree::
   :maxdepth: 1

   man/maas-region.8
   man/maas.8


***************
Developing MAAS
***************

.. toctree::
   :maxdepth: 2

   development/philosophy
   hacking
   models
   enum
   development/security
   development/building-packages
   development/cluster-registration
   development/cluster-bootstrap
   development/tagging
   development/preseeds
   development/metadata
   development/notifications
   development/rpc
   development/transactions
   development/notes/index


******************
Indices and tables
******************

.. toctree::
   :maxdepth: 2

* :ref:`genindex`
* :ref:`modindex`
* :ref:`search`
