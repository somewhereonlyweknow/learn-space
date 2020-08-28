[TOC]

# 浏览器相关

## 浏览器缓存机制

### 缓存类型
缓存可分为强缓存和协商缓存两种，强缓存不需要发送请求，直接使用本地资源，协商缓存，顾名思义，要和服务器协商确认资源是否过期，决定是否使用缓存资源

#### 强缓存
* HTTP 1.0 expires

第一次请求服务器时，服务器返回一个expires字段，是一个确定的时间，在这个时间之前，都不需要再发送请求，直接使用本地缓存。   
当然存在缺点，就是浏览器时间和服务器时间不一致，当修改浏览器本地时间时，有可能造成服务器文件已经更新，但本地时间还没过期，从而不会请求新的资源。后续慢慢的废弃了，但为了向下兼容，很多网站也还保留着。

* HTTP 1.1 Cache-Control

Cache-Control有很多值

1. no-cache 不是不缓存，是直接跳过强缓存发送请求，进行协商缓存
2. no-store 不缓存
3. private/public private只有客户端可以缓存，中间服务器，代理服务器等都不可以缓存，public都可以缓存
4. max-age 返回的是一个秒级时间，表示这一次请求多少s后都使用缓存，不发送请求，是一个相对时间，解决了上面expires的问题


**同时存在expires和Cache-Control时，优先采用Cache-Control**

#### 协商缓存
* Last-Modified & If-Modified-Since

第一次请求服!务器时，会返回一个Last-Modified，表示文件的最后修改时间，客户端拿到后将文件和Last-Modified都缓存，下次请求时，在请求头里加上If-Modified-Since，值为服务端上次返回的Last-Modified，服务端拿到后和服务器的最后修改时间相比，若匹配则返回304，不返回文件，不匹配返回200，返回新的文件内容

有个缺点就是Last-Modified是一个秒级时间，在同一秒内服务器更新了文件，最后更新时间是不会变的，导致无法请求到新的文件

* Etag & If-None-Match

为了弥补上一种方式的缺陷，采用Etag校验，Etag是根据文件内容进行的加密（类似于文件的md5值），第一次请求浏览器返回Etag，下次请求时浏览器通过If-None-Match将Etag发给服务器，服务器计算文件的Etag，进行比较，若匹配则返回304，不返回文件，不匹配返回200，返回新的文件内容

两者比较的话：
1. Etag比Last-Modified精度更高，因为可以通过文件内容进行判断
2. Last-Modified比Etag更快，因为前者只是记录了个时间，后者要根据文件内容生成

**同时存在时，优先采用Etag**


### 缓存位置
* Server Worker
* Memory Cache & Disk Cacke

比较常用的就是这两种，硬盘缓存和内存缓存。顾名思义，内存缓存肯定更快，但是存活时间短，渲染线程结束后就清楚了，硬盘缓存生命周期长，但是读取写入相对时间较长，但肯定要比网络请求来的快。

比较大的Css，JS，HTML直接进Disk Cache， 内存使用较高时，优先硬盘缓存

* Push Cache
HTTP2的内容


## 浏览器存储

### cookie

大小4KB，能存储的东西很少了。cookie设计的本意是为了弥补TCP协议的无状态，防止通信一次后，服务器就不知道自己是谁了。

缺点呢，cookie容量小，存储东西不多，并且在同一域名情况下，不管需不需要每次请求都会携带，大量请求时会造成巨大的性能浪费，而且cookie容易被劫持，如果在有效期内重新请求服务器了，就很危险了，可以设置为HttpOnly，让js无法读取cookie
### WebStorage
WebStorage分为localStorage和sessionStorage。只存储，不参与通信，避免性能浪费，存储空间5MB，能存储更多的东西。

localStorage浏览器共享，都可访问，持久化存储，手动清除才可以，不清除的话一直存在。   可以用localStorage存储一些稳定的资源，例如官网logo，base64资源。

sessionStorage会话级存储，只在当前对话内可访问，会话结束（tab页关闭）时自动清除  可以用来保存表单填写结果，防止因为刷新没了数据，还可以用来存储这次的浏览记录，会话结束后就不需要了。
### IndexDB
运行在浏览器端的**非关系型数据库**，就是个数据库，事务啥的都支持。

1.非关系型，用对象来存储，内部是键值对
2.受同源策略限制，无法跨域访问
3.一步操作



## 输入Url后的过程

### 网络请求

### 构建DOM树，样式计算，生成布局树

1. 阻塞和非阻塞

非阻塞的：async的js文件（仅下载过程不阻塞），img，iframe，不阻塞啥意思呢，就是说我这个图片请求就算还没回来，dom树已经建成了

为啥async的js也会阻塞呢，特别小下载特别快，html过大还没完全解析成功，会先执行阻塞html解析。

为啥defer是阻塞的，defer的下载过程不会阻塞，但是要在html解析完成后和DOMContentLoaded之前执行，所以也是阻塞的。

阻塞：所有内联的东西，外联的普通js，defer js，外联的css样式（可以看出cssom树和dom树是并行生成的）,感觉上是生成一部分了就会先绘制。


2. DOM树啥时候完成的

DOMContentLoaded代表DOM树构建完成了，兼容性问题，ie8以下可以通过document.readystate去判断

* loading 加载中
* interactive 文档加载完了，图片还没完成加载，相当于DOMContentLoaded
* complete 相当于window.onload

window.onload代表资源全部加载完了，非阻塞资源也加载执行完成

3. script尽可能放在body最后面（里面），style尽可能放在header

script标签的位置不会影响首屏时间，但有可能会截断首屏展示的内容。script放在body前面，加不加async，defer，不会对首屏有任何影响，只会对DOMContentLoaded和window.onload的时间产生影响，从而影响依赖他们的代码执行时机

style要尽可能尽早加载

4. 首屏时间


### 建图层树，生成绘制表，



## 攻击

### XSS
跨站脚本攻击（cross site scripting），为了不和css重名，用了xss。

1. 存储型。通过表单提交等，将数据提交给服务器，存储到数据库，在下次请求时返回恶意脚本给浏览器执行，达到攻击目的
2. 反射型。恶意脚本是通过作为网络请求的参数，经过服务器，然后再反射到HTML文档中，执行解析。和存储型不一样的是，服务器并不会存储这些恶意脚本
3. 文档型。不经过服务器，在数据传输过程中进行劫持修改，注入恶意脚本，包括路由劫持，本地恶意软件劫持等

解决方法呢
1. 永远不要相信用户输入，不管是服务端还是客户端，都要对用户输入进行校验，对标签进行转义，防止被注入
2. 利用CSP，就是浏览器安全策略，限制其他域下的资源加载。禁止向其它域提交数据。提供上报机制，能帮助我们及时发现 XSS 攻击。
3. 一般的注入是为了窃取cookie从而达到模拟用户进行操作的目的，设置cookie HttpOnly

### CSRF
CSRF(Cross-site request forgery)，跨站请求伪造，就是说你登录了一个正常的A网站，然后又访问了一个恶意B网站，这时B会发送一个请求给A网站，会自动带上你的cookie，成功模拟了你的操作，把你钱转走

1. 发送 get请求。向服务端发送GET请求，自动带上cookie，然后进行相应的操作
2. 表单提交，同样会携带cookie，让服务器以为是用户正常操作


和XSS攻击相比，CSRF不需要把代码注入到用户当前页面，而是通过跳转新的页面，然后通过服务器的验证漏洞和之前的登陆状态，伪造用户身份，进行恶意操作

防范用的最广泛的措施就是token，浏览器每次发送请求都要带上token，服务器来验证token是否合法，不合法直接拒绝，通常攻击者很难拿到这个token，也就没办法进行攻击了。

还可以通过cookie的SameSite，它有三个值：strict严格模式，只有当前域名会携带cookie，完全禁止第三方请求携带。Lax稍宽松一点，只有get请求或者a标签发起的请求会携带。None请求都会自动携带。

## 网络协议( HTTP，HTTPS，WebSocket，HTTP2，TCP)

### TCP链接

#### 标识位
URG：为1时，表示紧急指针有效
ACK：确认标识，连接建立成功后，总为1。为1时确认号有效
PSH：接收方应尽快把这个报文交给应用层
RST：复位标识，重建连接
SYN：建立新连接时，该位为0
FIN：关闭连接标识

#### 三次握手过程
总说TCP三次握手，真的了解吗

1. 客户端发送SYN给服务器，同时将客户端初识序列号x告诉服务端，SYN=1,seq=x，客户端进入SYN_SEND状态
2. 服务端收到后，服务端进入SYN_RCVD状态，发送ACK，同时将自己的初识序列号告诉客户端，SYN=1,ACK=1,seq=y,ack=x+1
3. 客户端收到后，发送ACK，ACK=1，seq=x+1,ack=y+1当服务端收到后，两者进入ESTABLISHED状态，可以通信了

#### 四次挥手过程
为啥要四次挥手，你说断开就断开呗，这么费劲呢，因为TCP半关闭特性造成的，所谓的半关闭，其实就是TCP提供了连接的一端在结束它的发送后还能接收来自另一端数据的能力。

1. 客户端告诉服务端，我要断开了，发送FIN，FIN=1,seq=w，客户端进入FIN_WAIT1状态
2. 客户端收到后，发送ACK，告诉客户端我收到了，ACK=1,seq=y,ack=w+1，同时进入CLOSE_WAIT状态，客户端收到ACK后进入FIN_WAIT2状态
3. 接下来服务端把一下数据发完了，告诉客户端，我要断开了，发送FIN，FIN=1,seq=z(注意这里和上面的序列号有可能不是+1)，服务器进入LAST_ACK状态
4. 客户端收到后发送ACK，告诉服务端你断开吧，同时进入TIME_WAIT状态，ACK=1,seq=w+1(这里一定是w+1，因为客户端断开后不会再发送数据),ack=z+1，客户端等待2MSL后断开连接

#### 一些问题
* 请画出三次握手和四次挥手的示意图
1. 三次握手
![](https://picb.zhimg.com/80/v2-2a54823bd63e16674874aa46a67c6c72_1440w.jpg)
2. 四次挥手
![](https://pic3.zhimg.com/80/v2-c7d4b5aca66560365593f57385ce9fa9_1440w.jpg)
* 为什么连接的时候是三次握手？

主要是为了防止因为网络延迟影响的数据包被迟到发送到服务器。假如两次握手就达成，当一个连接请求因为网络延迟没按时到达服务端，客户端又一次发送了一个连接请求，但当服务器又收到了这次连接请求，发送ACK给客户端，客户端根本不理，因为两次握手建立连接，相当于服务器一直有一个连接空着。   
那为啥不多几次握手呢，浪费呗，没有绝对安全的。

* 什么是半连接队列？

服务端接受SYN请求后，进入SYN_RCVD状态，这时请求是一种半连接状态，此时双方还没有建立连接，服务器把这种连接放到一个队列里，就是半连接队列

* ISN(Initial Sequence Number)是固定的吗？

不能是固定的，如果是固定的，中间人就可以猜到ACK，从而进行攻击

ISN = M + F(localhost, localport, remotehost, remoteport)

* 三次握手过程中可以携带数据吗？

前两次不可以携带数据，假如第一次握手可以携带数据，攻击者发起大量携带数据的请求，服务端接收过程中花费大量时间和存储空间来处理数据，使得服务器很可能被攻击

* 如果第三次握手丢失了，客户端服务端会如何处理？

1. 客户端。对于客户端来说，已经是ESTABLISHED状态了，client只能在向服务端发送数据时，服务器通过RST(强制断开TCP连接)包相应，客户端才能感知到ACK丢了
2. 服务端。服务端没有收到会进行超时重传，达到最大数量依然没有回应时，会断开该TCP连接

* SYN攻击是什么？

攻击者通过伪造ip向服务器发送大量的SYN请求报文，因为请求ip都是伪造的，当服务器放送SYN+ACK时就会不断重发直到最大限制，会大量占用半连接队列，导致服务器不能处理正常的请求连接，是典型的DOS攻击或者DDOS攻击。

检测的话也比较方便，当发现服务器存在大量半连接请求时，很大可能就是被SYN攻击了，预防方法有
1. 增大半连接队列
2. 缩短超时时间
3. 过滤网关防护
4. SYN cookies


* 四次挥手释放连接时，等待2MSL的意义?

主要是为了防止最后客户端发送给服务器的ACK丢失，假如不等直接关闭，最后一个ACK丢失了，服务端将一直处于LASK_ACK状态，不会关闭连接，浪费资源，所以要等待2MSL查看是否超时，如果ACK丢失服务端会再次发送FIN，走上述流程，若没有收到新的，证明没丢，正常关闭

#### 流量控制和拥塞控制
1.**流量控制**。 流量控制是一种端到端的策略，主要用来防止服务器发送过快超过浏览器所能接受的最大值，导致缓冲区溢出等问题。TCP通过滑动窗口协议实现流量控制，滑动窗口的大小代表着接收方缓存区还有多大空间，发送方还可以发送多少数据，当滑动窗口为0时，一般来说发送方停止发送数据，但有例外情况，一种是在紧急情况下可以发送数据，例如用户终止远端服务器进程，还有一种就是发送方可以发送1字节的数据报通知接收方重新发送其所期望的下一字节和滑动窗口大小

2.**拥塞控制**。不同于流量控制，拥塞控制是一个全局的控制机制，涉及到所有的主机，所有的路由器，以及与降低网络传输性能有关的所有因素，防止过多的数据注入网络，使网络中的路由器或者链路不至于过载。相比于流量控制，后者是一个点到点的发送控制，主要抑制发送方的发送，防止超过接收方的最大接收

为了进行拥塞控制，发送方会维护一个拥塞窗口的动态量，拥塞窗口大小取决于网络环境拥塞程度，并且动态变化，发送方发送数据大小取拥塞窗口和滑动窗口中的较小值

拥塞控制主要采用了四种算法，即慢启动，拥塞避免，快重传和快恢复策略。
* **慢启动**。慢启动就是限制HTTP1.*的主要原因，慢启动是最开始使拥塞窗口值为1，慢慢试探，经过一定时间（1个发送轮次）没有拥塞会进行加倍，避免了大量流量突然涌入网络，造成网络拥塞
* **拥塞避免**。 慢启动采用经过1个轮次拥塞窗口值进行翻倍，很容易错过网络拥塞的阈值，通过事先设定阈值，慢启动使得拥塞窗口达到了阈值后，采用拥塞避免机制，每次增加1，
* **快重传和快恢复**。数据丢包时，接收方接收到一个不按顺序的数据短，会一直发送相同的确认，如果发送方接收到3个相同的，可以确认该数据段丢失，并且快速重传该数据段。快重传机制能避免被动等待超时的等待时间，但还是无法确认该重传哪些报文

超时重传过程中，无法确认从哪里开始发送，所以在ACK基础上新增SACK字段，用来告诉发送端后续的哪些包收到了，然后发送端就可以确认丢了哪个，哪些收到了，重新发送时可以选择发送了。

3. **SACN & DSACK**   

假如1，2，3，4，5顺序发送给接收端，2丢了，然后接收端会返回ACK=2，SACK=3，依次ACK=2,SACK=3~4这种。
![](https://imgkr.cn-bj.ufileos.com/44438910-cc01-482c-8c8f-b04ab49381f8.png)

DSACK，重复SACK，告知发送方哪些数据重复接收了，帮助发送方判断，是否发生了包失序、ACK 丢失、包重复或伪重传。让 TCP 可以更好的做网络流控。
1) ACK丢失
![](https://imgkr.cn-bj.ufileos.com/0c61f0a1-b14f-490e-b397-254d0afacbf6.png)
2) 网络延时
![](https://imgkr.cn-bj.ufileos.com/d7f2babb-ff1f-4a85-aa4c-1b994c30f596.png)

### HTTP
HTTP无连接、无状态协议
#### 安全性和幂等性
安全性：方法不会产生副作用，不会产生安全问题，不会修改资源状态，但有可能每次返回都不相同

幂等性：每次返回相同，一次和多次调用结果相同

| 方法名 | 安全性 | 幂等性 |
| -- | -- | -- |
| GET |  是  | 是 |
| HEAD | 是 | 是 |
| OPTIONS | 是 | 是 |
| PUT | | 是 |
| POST | | 否 |
| DELETE | | 是 |

特别注意DELETE请求是幂等的，正常来讲第一次删除第二次就应该是404之类的了，但是由于规定他是幂等的，所以服务器要维护一个已删除列表

POST和PUT都是新建资源，但是POST不是幂等的，PUT确是，因为POST时，URL指向父级，资源在请求体中，PUT直接指向资源，POST可能产生两个资源，PUT只会创建一个资源


#### 版本对比
##### HTTP1.0 
1. 链接不可复用，每次请求必须重新建立tcp链接，链接无法复用就会导致每次重新建立链接都要经历三次握手和慢启动过程，导致大量资源浪费
2. 最大链接数限制，导致传输很慢了


##### HTTP1.1
1. 支持长链接，通过connection字段控制，默认开启长链接，可以通过设置connection为close关闭，结合管线化技术，可以在一个TCP链接上同时发送多个请求，
2.  holb(head of line blocking)，队首阻塞，会导致健康的请求被不健康的请求所影响，损耗网络环境，难以检测


相较于HTTP1.0，主要优化的部分包含：
1. 缓存处理，新增Cache-Control和etag等用于缓存校验
2. 减少tcp链接数，更大程度上的用了带宽
3. 错误处理更丰富，增加了很多错误码
4. 丰富请求头，例如增加Cache-Control、Host等

> 状态代码 状态信息 含义   
100 Continue 初始的请求已经接受，客户应当继续发送请求的其余部分。（HTTP 1.1新）   
101 Switching Protocols 服务器将遵从客户的请求转换到另外一种协议（HTTP 1.1新）
200 OK 一切正常，对GET和POST请求的应答文档跟在后面。   
201 Created 服务器已经创建了文档，Location头给出了它的URL。   
202 Accepted 已经接受请求，但处理尚未完成。   
203 Non-Authoritative Information 文档已经正常地返回，但一些应答头可能不正确，因为使用的是文档的拷贝（HTTP 1.1新）。    
204 No Content 没有新文档，浏览器应该继续显示原来的文档。如果用户定期地刷新页面，而Servlet可以确定用户文档足够新，这个状态代码是很有用的。    
205 Reset Content 没有新的内容，但浏览器应该重置它所显示的内容。用来强制浏览器清除表单输入内容（HTTP 1.1新）。    
206 Partial Content 客户发送了一个带有Range头的GET请求，服务器完成了它（HTTP 1.1新）。    
300 Multiple Choices 客户请求的文档可以在多个位置找到，这些位置已经在返回的文档内列出。如果服务器要提出优先选择，则应该在Location应答头指明。    
301 Moved Permanently 客户请求的文档在其他地方，新的URL在Location头中给出，浏览器应该自动地访问新的URL。    
302 Found 类似于301，但新的URL应该被视为临时性的替代，而不是永久性的。注意，在HTTP1.0中对应的状态信息是“Moved Temporatily”。
出现该状态代码时，浏览器能够自动访问新的URL，因此它是一个很有用的状态代码。
注意这个状态代码有时候可以和301替换使用。例如，如果浏览器错误地请求http://host/~user（缺少了后面的斜杠），有的服务器返回301，有的则返回302。
严格地说，我们只能假定只有当原来的请求是GET时浏览器才会自动重定向。请参见307。    
303 See Other 类似于301/302，不同之处在于，如果原来的请求是POST，Location头指定的重定向目标文档应该通过GET提取（HTTP 1.1新）。    
304 Not Modified 客户端有缓冲的文档并发出了一个条件性的请求（一般是提供If-Modified-Since头表示客户只想比指定日期更新的文档）。服务器告诉客户，原来缓冲的文档还可以继续使用。    
305 Use Proxy 客户请求的文档应该通过Location头所指明的代理服务器提取（HTTP 1.1新）。    
307 Temporary Redirect 和302（Found）相同。许多浏览器会错误地响应302应答进行重定向，即使原来的请求是POST，即使它实际上只能在POST请求的应答是303时 才能重定向。由于这个原因，HTTP 1.1新增了307，以便更加清除地区分几个状态代码：当出现303应答时，浏览器可以跟随重定向的GET和POST请求；如果是307应答，则浏览器只能跟随对GET请求的重定向。（HTTP 1.1新）    
400 Bad Request 请求出现语法错误。    
401 Unauthorized 客户试图未经授权访问受密码保护的页面。应答中会包含一个WWW-Authenticate头，浏览器据此显示用户名字/密码对话框，然后在填写合适的Authorization头后再次发出请求。    
403 Forbidden 资源不可用。服务器理解客户的请求，但拒绝处理它。通常由于服务器上文件或目录的权限设置导致。    
404 Not Found 无法找到指定位置的资源。这也是一个常用的应答。    
405 Method Not Allowed 请求方法（GET、POST、HEAD、DELETE、PUT、TRACE等）对指定的资源不适用。（HTTP 1.1新）    
406 Not Acceptable 指定的资源已经找到，但它的MIME类型和客户在Accpet头中所指定的不兼容（HTTP 1.1新）。    
407 Proxy Authentication Required 类似于401，表示客户必须先经过代理服务器的授权。（HTTP 1.1新）    
408 Request Timeout 在服务器许可的等待时间内，客户一直没有发出任何请求。客户可以在以后重复同一请求。（HTTP 1.1新）    
409 Conflict 通常和PUT请求有关。由于请求和资源的当前状态相冲突，因此请求不能成功。（HTTP 1.1新）    
410 Gone 所请求的文档已经不再可用，而且服务器不知道应该重定向到哪一个地址。它和404的不同在于，返回407表示文档永久地离开了指定的位置，而404表示由于未知的原因文档不可用。（HTTP 1.1新）    
411 Length Required 服务器不能处理请求，除非客户发送一个Content-Length头。（HTTP 1.1新）    
412 Precondition Failed 请求头中指定的一些前提条件失败（HTTP 1.1新）。    
413 Request Entity Too Large 目标文档的大小超过服务器当前愿意处理的大小。如果服务器认为自己能够稍后再处理该请求，则应该提供一个Retry-After头（HTTP 1.1新）。    
414 Request URI Too Long URI太长（HTTP 1.1新）。    
416 Requested Range Not Satisfiable 服务器不能满足客户在请求中指定的Range头。（HTTP 1.1新）    
500 Internal Server Error 服务器遇到了意料不到的情况，不能完成客户的请求。    
501 Not Implemented 服务器不支持实现请求所需要的功能。例如，客户发出了一个服务器不支持的PUT请求。    
502 Bad Gateway 服务器作为网关或者代理时，为了完成请求访问下一个服务器，但该服务器返回了非法的应答。    
503 Service Unavailable 服务器由于维护或者负载过重未能应答。例如，Servlet可能在数据库连接池已满的情况下返回503。服务器返回503时可以提供一个Retry-After头。    
504 Gateway Timeout 由作为代理或网关的服务器使用，表示不能及时地从远程服务器获得应答。（HTTP 1.1新）    
505 HTTP Version Not Supported 服务器不支持请求中所指明的HTTP版本。（HTTP 1.1新）    

##### HTTP2
1. **多路复用技术**，相较于HTTP1.1，不用等待上一个请求的结果才能处理下一个请求结果，通过**二进制分帧层**把HTTP协议的通信的基本单位缩小为帧，可以在TCP连接上并行传输，然后进行排序。二进制分帧把HTTP的首部信息封装到HEAD frame里，将请求体封装到DATA frame里。HTTP2可以承受任意数量的双向流量，由于TCP协议的慢启动机制，使得HTTP这种突发、短暂的链接变得很低效，HTTP2通过使用一个TCP链接进行传输，可以更有效的使用TCP链接，让带宽提升HTTP的性能

单链接多资源能够有效降低服务器压力，内存占用更少，增大服务器吞吐量，减少了TCP慢启动的时间，提升传输速度
2. **首部压缩**。通过维护静态字典和动态字典，用更少的字符替换原本的很多字符，减少数据传输
3. **Server Push**。支持服务端推送，以前只能客户端被动的请求资源，HTTP2支持在解析请求的时候，将相关资源直接推送给客户端，减少请求数，使得服务器能利用空闲的网络传输更多的资源，减少页面加载时间

##### 断点续传功能
在HTTP1.1之后加入了Range头，客户端需要记录上次断的位置。例如请求一个1M的文件，在512K的时候断了，下次请求时需要在头部加上Range:bytes=512000，这样服务器会从这里开始发送文件，状态码更新为206，头部加上Content-Range:bytes

有一种特殊情况，请求续传时，文件变了，需要通过判断缓存的方式判断，也可以用If-Range带上，让服务端判断，过期了就返回200和全部文件，否则就206续传

### HTTPS
HTTPS不是一个新协议，相当于是加强版的http协议，基础的HTTP协议直接将数据通过表示层、会话层将数据交给了TCP，HTTPS协议在基础上增加了加密和证书认证的过程。

#### 加密方式
##### 对称加密
对称加密，加密和解密过程用同一个密钥，加密算法同时也可以解密，这种传输有个问题就是任何一个中间人获得了密钥都可以对数据进行解密，从而篡改。   
过程：客户端发送一个client_random和加密算法列表给服务端，服务端收到后选择加密算法和server_random给客户端，两边用这个加密算法和client_random和client_random生成密钥进行通信，中间人很容易获得密钥

##### 非对称加密
非对称加密，有一对密钥，公钥加密的数据只能用私钥解密，反之毅然。

过程：客户端发送一个client_random和加密算法列表给服务端，服务端收到后选择加密算法、公钥和server_random给客户端，客户端拿到后用公钥加密client_random和server_random生成通信暗号。

但由于是非对称加密，服务器只能通过私钥加密数据，若用公钥加密，浏览器无法解密，中间人一旦拿到公钥，就可以解密了。

同时非对称加密对服务器性能消耗非常巨大，一般不采用非对称加密

##### 结合进行加密（TLS的握手过程）
通过将对称加密和非对称加密结合，实现安全通信（没有绝对安全的）

过程：
1. 客户端发送client_random和加密算法列表给服务端
2. 服务端接收后，发送server_random、公钥、加密算法给到客户端
3. 浏览器接收后，生成一个pre_random，用公钥加密后发送给服务器
4. 服务器接收后用私钥解密获得pre_random。
这时两者同时拥有三个随机数，将三个随机数混合生成密钥，接下来的通信用该密钥对数据对称加密，因为中间人很难得到pre_random，所以就很难破解密钥从而破解密文

#### 证书认证
但上述过程还是有一个问题，假如A和B通过上述过程进行通信，有一个中间人C，伪造身份和A、B进行通信，因为他能得到所有的东西，所以A、B并不知道中间有人窃取，一直认为是在彼此通信。或者黑客伪造一份公钥和私钥，用户也不知道自己访问的是危险服务器

所以引入了证书认证，证书由权威机构CA颁发，服务器运营者向CA获取授权，证书主要有两个作用：
1. 让浏览器知道自己访问的服务器是否安全
2. 把服务器公钥传给浏览器

证书在第2步发送server_random时发送给浏览器，同时包含了公钥，这时浏览器会先判断证书是否合法，是否是自己访问的域名等等，验证通过则继续后面的通信过程，否则拒绝执行。

**证书认证过程**。在CA进行证书签名时会保存一个Hash函数，读取证书明文内容，通过Hash函数计算明文内容得到信息1，然后用公钥解密明文内容得到信息2，比较两者是否相同，相同则验证通过。


### Websocket


### 网络协议相关总结XMind
![](https://cbshowhot.cdn.changbaimg.com/!/learn/xmind.png)

## 同源、跨域
**什么是跨域**。一个域下的文档或者脚本去请求另一域的资源

**为什么会跨域**。 浏览器的同源策略，同源（协议、域名、端口）必须相同
跨域情况下无法读取存储、无法获取DOM和js对象、无法发送ajax请求

### 跨域解决方案

#### JSONP
通过script标签可以跨域的属性，动态拼接src，请求跨域资源，同时携带callback函数名称，严格要求服务端返回的是函数调用，同时将数据当作参数传回。

缺点：仅支持GET请求，对服务端要求严格。

原生通过创建script方式，jq可以用ajax请求的dataType:jsonp，vue可以用$http.jsonp

#### CORS
##### 服务器设置允许跨域   
在没有设置任何东西的情况下，浏览器会报错，信息如下

然后通过设置相应头中的Access-Control-Allow-Origin包含当前发送请求的域名就可以，如果允许所有跨域，可以设置为*

这时基本的请求，get,post已经没问题了，但是put等请求方式依然不行。报错提示这种请求方式不被服务器所允许，这时需要设置Access-Control-Allow-Method，使得可以使用put等请求。

还有其他一些字段，一起总结下把
| 字段 | 用途 |
| -- | -- |
| Access-Control-Allow-Origin | 允许跨域域名 |
| Access-Control-Allow-Method | 允许跨域使用的除了普通方法之外的方法 |
| Access-Control-Allow-Headers | 允许跨域设置的header |
| Access-Control-Max-Age | 跨域预检的时效（单位秒，在多少秒内不用再次预检） |
| Access-Control-Allow-Credentials | 允许跨域cookie，需要浏览器设置withCredentials = true；
| Access-Control-Expose-Headers | 允许浏览器读取的响应头 |

为什么要设置预检时效，跨域请求过程中，会先向服务器一个预检OPTIONS请求，该方法返回允许访问的methods,如果请求方法不在methods中则报错，存在的话，就发送真正的请求，避免每次都要预检，所以设置一个预检时效，在一段时间内不用在此进行预检可直接发送请求。

设置之前每次复杂跨域请求之前都会先发送一条预检请求，设置了过期时间之后，在相应时间段内不会再次预检直接发送请求，有时候你会发现设置失效了，把chrome的Disabled Cache去掉就OK了

#### http-proxy
代理服务器，启动一个代理服务器，服务器请求服务器是没有跨域的，然后代理服务器和当前网站在同一个域，就实现了跨域。

node下用http-proxy-middleware中间件。

webpack的devServer的proxy，就是用node在本地起了一个代理服务器，很好理解了。

#### 窗口间跨域
##### postMessage
通过postMessage和监听message事件，实现通信。postMessage主要用来实现多窗口之间通信，但是他有第二个参数origin，可以向任何域发送消息，所以被用来作为一种跨域方式

##### window.name + iframe
主要是3个页，iframe引入一个跨域的页，无法直接访问其window.name，所以通过一个和主页同源的一个页，在iframe第一次load结束后直接替换为同域的空文件，这时可以访问到window.name。感觉没啥用，实际开发过程就用不到

##### document.domain
document.domain跨域只适用于两个不同子域的页面，例如map.baidu.com和baike.baidu.com，通过设置docuemnt.domain = 'baidu.com'，就可以访问了，也用不到

#### 小总结
总结下来，简单的get请求jsonp就可以，但现在很少用了，大型项目代理可以用nginx反向代理，CORS，窗口之间PostMessage，其他都不常用，你说取个window.name有啥用，又不能传参。websocket也可以跨域。