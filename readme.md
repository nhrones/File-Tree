# File-Tree RPC

This application demonstrates RPC calls to an RPC broker service.    

The app initially makes a call to get all items from the root folder.    
The data returned is then loaded in a treeview UI.    
Selecting an item in the treeview will request its content from the broker.    
Any text content will then be presented in a text editor control.    
If you edit the text, and then click the `save` button, the broker will be used to write the text back into the file.    

All of this is accomplished by means of Remote Procedure Calls - RPC.  

![Alt text](RPC.png)

<br/>

## Please see: https://github.com/nhrones/RPC-Broker