const nts=require("node-teamspeak");
function client(ip) {
  const cl=new nts(ip);
  var items=[];
  var cserver=false;
  var pause=true;
  function work() {
    var i=items.pop();
    pause=false;
    function c(err,resp,raw) {
      /*try {
        if (err) console.log(err);
        i.c((err) ? new Error(err.msg) : err,resp,raw);
      } catch(e) {
        console.log("callback failed",e);
      }*/
      if (err) console.log(err);
      i.c((err) ? new Error(err.msg) : err,resp,raw);
      return process.nextTick(work);
    }
    if (i) {
      if (i.server&&c.server!=i.server) {
        cl.send("use",{sid:i.server},function(err) {
          if (err) {
            c(err);
          } else {
            cserver=i.server;
            cl.send(i.cmd,i.args,function(err,resp,raw) {
              c(err,resp,raw);
            });
          }
        });
      } else if (i.server&&c.server==i.server) {
        cl.send(i.cmd,i.args,function(err,resp,raw) {
          c(err,resp,raw);
        });
      } else if (!i.server&&c.server) {
        cl.send("logout",{},function(err) {
          if (err) {
            c(err);
          } else {
            cserver=false;
            cl.send(i.cmd,i.args,function(err,resp,raw) {
              c(err,resp,raw);
            });
          }
        });
      } else if (!i.server&&!c.server) {
        cl.send(i.cmd,i.args,function(err,resp,raw) {
          c(err,resp,raw);
        });
      }
      //console.log(items.length,cserver);
    } else {
      pause=true;
    }
  }
  this.send=function(cmd,args,call) {
    var r={cmd:cmd,server:args.server,c:call};
    delete args.server;
    r.args=args;
    items.unshift(r);
    if (pause) {pause=false;process.nextTick(work);}
  };
}
module.exports=client;
