[TOC]

# Git学习总结

## 初始化
init  本地生成.git目录，保存版本信息，可以查看，如果已有仓库直接git clone就可以
```
$ git init  // 初始化

$ ls ./git  // 查看

$ cat ./git/HEAD  // 查看HEAD指向

$ git remote add origin 仓库地址http // 建立远程链接

$ git remote set-url origin 仓库地址  // 修改远程连接，换个仓库
```

## 命令别名(个人习惯)
```
$ gst // git status

$ glg -n // git log -n

$ gb  // git branch

$ gco  // git checkot

$ ga  // git add

$ gcmsg // git ci -m

$ gl  // git pull

$ gm // git merge

$ gr // git remote 查看远程仓库
```

## 使用
### 推代码过程 
```
$ git status // 查看当前状态

$ git add . // 将所有修改提交到暂存区

$ git ci   // 将暂存区提到本地仓库

$ git push // 推到远程分支
```

### 代码回滚
* 未add的文件    
``` 
$ gco filename
```
如果新文件，得手动改，或者直接删了重写吧，已提交的文件，从暂存区恢复文件，覆盖工作区修改

* 已add 未commit   
``` 
$ git reset --hard HEAD <filename>
``` 
从最近一次提交恢复代码，然后暂存取变为未add状态
![]()

* 已经commit了的   

已经commit了怎么办呢，已经commit就会在log里形成记录了，找到要回退的版本，改变HEAD指向不就ok了,上次HEAD^, 上上次的话就HEAD^^,实际就是改变HEAD指向
```
$ git reset --hard HEAD^
```
发现文件果然回来了，git log 中也没有上次记录了，文件也恢复到上次了，那如果再想回去呢
```
$ git reflog // 查操作日志找到上次的版本
$ git reset --hard version  // 回到制定版本
```

* 提交到远程了呢   
 
那就没招了 本地回滚再提交吧
```
$ git reflog // 查下日志版本号

$ git reset --hard  // 恢复本地分支版本

$ git push -f  // 强制推到远程分支，因为本地已经落后远程了
```
后续尝试整个流程过程中，分支图情况    
经过尝试，远程分支没有新建节点，而是直接替换了,reflog可看到，HEAD节点先是回退到了上个版本，然后又指向了新提交，不留痕迹的撤销了

![](https://cbshowhot.cdn.changbaimg.com/!/baofang/reset.png)


* 远程公共分支怎么办    

**第一种方法**    
假设master是这样的 a1->a2->b1,突然发现a2有问题，要回退到a1，该怎么办   

直接git reset --hard a1, 这样远程分支确实回到了a1，但是你的队友呢，他们gst看一下，提示**ahead of master by 2 commits** 然后队友按照提示，直接git push了，白干了。

如果没有提交的话，直接git pull 用远程覆盖本地就ok了``` $ git reset --hard origin/master```

那B怎么办呢。
```
$ gco my_branch  // 先回到自己分支

$ git reflog // 查下当前的提交

$ git reset --hard b1  // 回到b1这次提交

$ gco -b back_branch // 新建回退分支，保存下b1这次提交，不能直接从master新建，因为master含有a2

$ gco my_branch // 回到自己分支

$ git reset --hard commitid // 回到自己分支的最前端
```
现在自己分支很正常，back_branch保存的是b1提交，这时回到master， ```$ git reset --hard origin/master```， 用远程强行覆盖，然后本地master变为了a1,
然后```$ git merge back_branch```完事了，master回到了a1->b1，完美   
但是很复杂啊，不优雅

**第二种方法**    




* 删除文件  

git rm 和 git rm --cache   
```
$ git rm  // 删除无用文件   

$ git rm --cache  // 更改.gitignore对已添加到版本库的文件不生效，可以通过该命令删除远程，同时保留本地，然后使得.gitignore对该文件生效
```

* 删除分支
```
$ git push origin :feature_name  // 省略本地分支名， 相当于推了个空分支到远程

$ git push origin feature_work:feature_origin  // 如果有关联 可以直接git push
```
![](https://cbshowhot.cdn.changbaimg.com/!/baofang/rm-branch.png)


* reset vs revert
假设分支当前提交为a->b->c->d， b有错误，想回滚
reset通过将指针后移，实现回滚，git reset a,变为a，然后将c d merge过来，变为a->c->d.   
revert通过生成新的提交实现回滚，指针前移，git revert c, 变成a->b->c->d->e
```
$ git reset HEAD // 版本回滚 工作区恢复
    --soft 回退后分支修改的代码被保留并标记为add的状态（git status 是绿色的状态）
    --mixed 重置索引，但不重置工作树，更改后的文件标记为未提交（add）的状态。默认操作。
    --hard 重置索引和工作树，并且分支修改的所有文件和中间的提交，没提交的代码都被丢弃了。
    --merge 和--hard类似，只不过如果在执行reset命令之前你有改动一些文件并且未提交，merge会保留你的这些修改，hard则不会。【注：如果你的这些修改add过或commit过，merge和hard都将删除你的提交】
    --keep 和--hard类似，执行reset之前改动文件如果是分支修改了的，会提示你修改了相同的文件，不能合并。如果不是分支修改的文件，会移除缓存区。git status还是可以看到保持了这些修改。
    
$ git revert version // 撤销某次提交

```

### 解决冲突

* 树冲突   

对文件进行操作产生冲突，如同时修改文件名，删除文件，一般```git status```显示为 added by us, added by them, both deleted, deleted by them等，这种情况下解决，保留正确文件，删除错误即可。   
例如：
```
deleted by them: a.txt
both deleted: b.txt
added by thme: c.txt
```
这个时候如果想保留a.txt, 直接add就好，删除的话git rm掉， 然后commit就可以

* 内容冲突

比较常见的冲突，一般都是内容冲突，两个用户同时修改同一文件，就会产生冲突   
<<<<<<<< HEAD codeA  =========== codeB >>>>>>>>>>>>feature/test     
冲突部分已经标出，前面是HEAD的code, 后面是分支修改的code，在一些工具里会直接提示应用哪个修改，手动改的话，删除标记，删除无用代码。解决后重新提交就可以了

* 逻辑冲突      

没明白咋回事，有时间再看看


* testing冲突解决

首先千万不要把testing合到自己的开发分支，这样会把一些测试代码带到自己的分支，看log有很多into testing被带到了自己的分支，但是和testing比较时是没有change的，看不到很容易就忽略了，但是合master时就会有很多change，这时候如果还没看就gg了。所以不要把testing往本地分支合并，浏览器里的解决冲突也是首先执行```$ git merge testing```。

**所以不要相信浏览器的那个解决冲突，也不要相信它的命令行提示**

master分支解决冲突可以直接用浏览器或者命令，因为咱们的开发分支都是从master捡出来的，所以把master merge到开发分支不会有问题，可以直接用浏览器解决。


如果误操作了把testing合到了开发分支怎么搞呢。   


1. 这时候查```$ git log``` 你会发现很难搞哦，多了很多commit，想找到自己分支原来的那个commitid太难了，当然如果你真的记得原来是多少，那就直接```$ git reset --hard version```,ok了，分支回到了原来的样子了（```$ git merge --abort```不好用，提示HEAD missing）；
![](https://cbshowhot.cdn.changbaimg.com/!/baofang/git-log.png)
2. 但这个时候查**操作日志**就会很简单了```$ git reflog```，只有那么几条，很轻松的就找到了commitid，然后reset就好了   
![](https://cbshowhot.cdn.changbaimg.com/!/baofang/git-reflog.png)

**那testing怎么正确解决冲突呢**

1. 首先在本地拉testing分支最新代码 ``` $ git checkout -b testing origin/testing```,如果有了就直接pull最新代码就好。
2. 然后将开发分支merge到testing，在testing分支上执行``` $ git merge feature/my_branch```
3. testing上解决冲突，commit代码，由于testing不允许直接push,然后将这个分支代码推到一个远程新建分支，例如**feature/my_branch_resolved**，``` $ git push testing:feature/my_branch_resolved, 然后将feature/my_branch_resolved合并到testing
4. 然后直接删除feature/my_branch_resolved，浏览器操作或者``` $ git push origin :feature/my_branch_resolved```
5. 本地testing拉远程最新代码，切换回自己的分支
6. 直接用testing分支的文件覆盖本地冲突文件，因为已经解决冲突了，没问题的，``` $ git checkout testing filename ```
7. commit, push。


### 多分支开发(git stash)

多分支同时开发有什么问题呢，目前我遇到就是通常你在这里开发，那边来了个bug，或者很多bug。。。。 这时候怎么办，切分支改bug吧，但是切分支之前，还要让本分支clean，这怎么办呢，目前的解决方法是add， commit，产生一次无用的commit，难受不，看着挺难受的

这个时候stash就来了

先将本地修改推到git栈，通过``` $ git stash ``` ，可以通过添加save 'msg'， 来区别每一次stash，可以通过``` $ git stash list ``` 查看所有的stash，保存好后执行status，当前分支就clean了，没问题了，切分支改bug吧

那回来怎么做呢，``` $ git stash pop ```将最近一次栈记录出栈，恢复，也可以通过``` $ git stash apply```将stash多次都恢复，但不删除stash拷贝，完美回来了，真好用

总结一下：    
```
$ git stash save 'name' // 将文件缓存
$ git stash list // 查看所有stash
$ git stash show stashname // 查看某一次stash修改 -p 查看diff
$ git stash pop // 应用栈顶的stash，最近一次，然后删除
$ git stash apply // 应用所有stash，不删除
$ git stash drop name // 删除某次stash
$ git stash clear // 删除所有stash  
```

stash不会缓存新增文件和忽略的文件，通过-u 可以缓存新增文件，-a 可以缓存所有修改
