Title: Build a Python IDE for Windows with Notepad++ and IPython
Tags: python

I've been looking for a good and free Python IDE for Windows for a long time. I first used
[Eclipse](http://www.eclipse.org/) and [Pydev](http://pydev.org/), but
Eclipse is a bit of a *"usine à gaz"*. I tried
[Spyder](http://code.google.com/p/spyderlib/) but it crashed too often
and it was not flexible enough. I ended up using
[Notepad++](http://notepad-plus-plus.org/), a really fast and powerful
text editor, with the great command-line interpreter
[IPython](http://ipython.org/). Notepad++ is extremely light to use,
opens within a second, and contains most important features a Python
developer wants (syntax highlighting, automatic indentation, code
folding...). However, it does not include a native way for running
Python scripts. On the other hand, IPython is a widely used and
extremely powerful Python interpreter that is well adapted for
scientific computing. It allows to run scripts in a command-line
interface, and offers the possibility to continue an interactive session
afterwards. It also includes a debugger and many more features.

<!-- PELICAN_END_SUMMARY -->

Unfortunately, using both Notepad++ and IPython in a convenient way
during an interactive session, where one edits a script and runs it many
times, is not straightforward. One can simply open both programs, with
IPython opened in the script directory, and call the magic *%run
script.py* command repeatedly. However, when calling *%run* several
times, the Python script is correctly reloaded every time, but not the
imported modules that could also have been edited in Notepad++. In other
words, if one runs a script which depends on different modules, and
edits one such module, those modifications won't be effective at the
next *%run* command. One has to import and reload that specific module,
which can be tiresome when editing a lot of different modules. There
appears to be no way of resetting the whole IPython environment and
reloading all modules. So typically one has to close and open again
IPython in the right working directory. This is cumbersome since every
edition-evaluation loop requires to close the IPython interpreter, open
it again, put the window at a convenient place on the screen, go in the
right directory, and run the script. Over and over again, even when
changing just one line of code in an imported script.

Those little issues might seem unimportant, but they can really hurt
productivity and prevent the user from focusing on its core work.
Therefore I've been looking for a way of automating this interactive
edition-evaluation loop with Notepad++ and IPython. The goal is to let
the user press a single keyboard button (e.g. F6) in a Python script
opened in Notepad++ in order to execute it in IPython. One should have
also a simple way of reloading all modules if needed. Here is what I
came up with. This method may certainly be improved, and it could even
be adapted to other OS than Windows.

This method works with Python 2.7, IPython 0.13 and Notepad++ 6.1.3 (it
will probably work with other versions, but it may require small
modifications).

First, create a custom IPython script that will define two new magic
commands in IPython called *%cdrun* and *%cdrunkill*. Both open a new
IPython interpreter, set a specific working directory, and run a Python
script. The second command also kills any existing IPython interpreter
(corresponding to a hard restart of IPython). This script will be loaded
at every IPython launch, so it should be placed here:

    :::text
    C:\Users\<USERNAME>\.ipython\profile_default\startup\cdrun.py

This file contains the following code.

    :::python
    import os
    from subprocess import Popen, PIPE

    ip = get_ipython()

    def kill_python():
        # kill all other python processes
        pid = str(os.getpid())
        cmd = ['tasklist', "/FO", "LIST", "/FI", "IMAGENAME eq python.exe"]
        r = Popen(cmd, stdout=PIPE).communicate()[0]
        r = r.split("\n")
        ps = []
        for line in r:
            if line[:3] == 'PID':
                ps.append(line[4:].strip())
        if pid in ps:
            ps.remove(pid)
        n = len(ps)
        if n == 0:
            return
        args = " ".join(["/pid %s" % p for p in ps])
        cmd = "taskkill /F %s" % args
        os.system(cmd)
        return n

    def cdrun(self, arg):
        h, t = os.path.split(arg)
        ip.magic("cd %s" % h)
        ip.magic("run %s" % t)

    def cdrunkill(self, arg):
        kill_python()
        h, t = os.path.split(arg)
        ip.magic("cd %s" % h)
        ip.magic("run %s" % t)

    ip.define_magic('cdrun', cdrun)
    ip.define_magic('cdrunkill', cdrunkill)

The *kill\_python* function kills all Python processes except the
current one. Hence this script allows to automatically close a previous
IPython interpreter and open a new one, resolving the module reloading
issue. If you want to open a new IPython interpreter without killing all
Python processes (for example, with a multicore computer, launching
several scripts in different IPython interpreters can make them run in
parallel on several CPUs), you can use the first command *cdrun*.

Next, you can specify the screen location and the size of the Ipython
window. It is very convenient because it allows you to put the
Notepad++, say, on the left of the screen, and the IPython interpreter
on the right, so that you don't have to manually move the IPython window
every time you launch a new interpreter (otherwise Windows tends to put
it at random locations). To do this, [edit the window properties of the
IPython prompt](http://commandwindows.com/configure.htm) (see method on
this website).

Third, define a new macro in Notepad++, by editing or creating the
following file:

    :::bash
    # in C:\Users\<USERNAME>\AppData\Roaming\Notepad++\shortcuts.xml
    ipython -i -c "%cdrun $(FULL_CURRENT_PATH)"  
    ipython -i -c "%cdrunkill $(FULL_CURRENT_PATH)"

The buttons \#117 and \#118 correspond to F6 and F7 here. If other
commands exist, just add the *\<Command\>* lines in the
*\<UserDefinedCommands\>* section. If those shortcuts don't work, it may
be because they are already assigned to other commands: go in Settings,
then Shortcuts, and remove them.

Also, do not edit this XML file with Notepad++, because your
modifications may be discarded when you close Notepad++. Instead, ensure
that Notepad++ is closed, edit the file with Notepad, and reopen
Notepad++.

Now, when you open a Python script in Notepad++, you can press F6. It
will launch an IPython window and execute the script. At the end of the
execution, you can interact in the IPython interpreter. If you need to
execute the script again, just use the following command:

    :::python
    %run script.py

This will reload *script.py*, but not other modules. If you need to
reload everything, press F7 in Notepad++: it will close the IPython
window and open a new one, at the same location on the screen. This
gives you the illusion of a very light and basic Python IDE, and allows
you to benefit from both the great editing features of Notepad++ and the
powerful IPython interpreter at the same time.

**Note**: you can automate the process of re-evaluating the script in
IPython. Here, you need to: save the script in Notepad++, set the focus
to IPython (with the mouse or with ALT+TAB), and type again the *%run*
command (or selecting it in the command history). With the very powerful
tool [AutoHotkey](http://www.autohotkey.com/), you can create a simple
script for automating these keystrokes. Create a text file named
"ipython\_update.ahk" somewhere and put the following code:

    :::ahk
    SetTitleMatchMode, 2
    IfWinExist Notepad`+`+
    {
        WinActivate
        Send ^s
        SetTitleMatchMode, 1
        IfWinExist ipython
        {
            WinActivate
            Send `%run %1%`r
        }
    }

Now, in Notepad++, create a new command for launching this script with
the current file as parameter:

    :::bash
    autohotkey [YOURPATH]\ipython_update.ahk $(FILE_NAME)

Ensure that the autohotkey.exe binary is in the Windows Path. Now,
pressing F8 in Notepad++ will automatically set the focus to IPython and
run your script.

**Note for Linux users**: Here is a Python function for killing all
Python processes except the current one on Linux that might be useful.

    :::python
    def kill_python():
        """
        Linux version (not very well tested, might need some tweaking)
        """
        pid = str(os.getpid())
        cmd = "ps -ef | grep python | awk '{print $2}'"
        r = commands.getoutput(cmd)
        r = r.split('\n')
        if pid in r:
            r.remove(pid)
        n = len(r)
        r = ' '.join(r)
        cmd = 'kill %s' % r
        os.system(cmd)
        return n
