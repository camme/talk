# talk

Abstract the way your node applications talk to each other so you can implement what ever protocol you want (http, sockets etc) with the same interface.

- Optimize which protocol you use later in the project
- Choose which protocol is the best for your application, even late in a project
- Handle basic balancing if needed

### Dont use it just yet
Its currently in a very alpha stage and serves more as a test and proof of concept than anything else. But it will evolve into a finished module.

### Next steps

- Add methods to add balancing functions from outside the module
- Add methods to add protocols from outside the module


### Contributions

The idea to do this came from when [Camilo Tapia](https://github.com/camme) and [Chris Hedgate](https://github.com/chrishedgate) discussed how to create an application for a client.
