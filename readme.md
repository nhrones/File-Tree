# File-Tree RPC

This application demonstrates RPC calls to an RPC broker service.    

The app initially makes a call to get all items from the root folder.    
The data returned is then loaded in a treeview UI.    
Selecting an item in the treeview will request its content from the broker.    
Any text content will then be presented in a text editor control.    
If you edit the text, and then click the `save` button, the broker will be used to write the text back into the file.     

## See it: https://nhrones.github.io/File-Tree/    

All of this is accomplished by means of Remote Procedure Calls - RPC.     

![Alt text](RPC.png)

<br/>

## Please see: https://github.com/nhrones/RPC-Broker

## Bueno-RPC flow
You can think of Bueno-RPC as a type of request/response communication system.    
We have a client asking a server to process some input and eventually return the output in a streamed response. This all happens as a **_single asynchronous transaction_**:    
  - The client sends the request using a request-map, rather than waiting for the response. 
  - The request-map returns a request-promise to the client, leaving it unblocked.    
  - The request-map assigns to the request a unique transaction ID (txID). 
  - This txID is used by both the client and the server.    
  - Eventually, the server will process the request and stream a response message back.
  - All responses from the server will contain the original txID. 
  - The request and response are matched on the client side by looking up the txID in the request-map.
  - The request-promise is then
  - The request-promise for this txID is either resolved or rejected based on the response. 