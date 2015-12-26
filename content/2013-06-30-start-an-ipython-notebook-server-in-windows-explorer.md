Title: Start an IPython notebook server in Windows Explorer
Tags: python

When one starts using the IPython notebook seriously, there is often the need to open a server in the current directory to open or create a new notebook. Whereas this is straightforward on Unix systems (e.g. `ipython notebook --pylab inline`) since users typically use mainly the command-line, it is a bit more cumbersome from the graphical Windows Explorer. One needs to open a console, go in the current directory, type the command, open the browser, and go to `http://127.0.0.1:8888` (unless the browser automatically launches).

Here is a simple method to simplify the process. It is based on the great [AutoHotKey](http://www.autohotkey.com/) tool which lets one automate repetitive tasks with e.g. keyboard shortcuts.

<!-- PELICAN_END_SUMMARY -->

Here is a script launching an IPython notebook server in the current active window:

	:::ahk
    #SingleInstance Force
    #NoTrayIcon

    SetTitleMatchMode RegEx

    ; Press CTRL+I in a Windows Explorer window to launch a IPython notebook server
    ; in the current folder.
    ^i::
    ; Get the current path.
    Send ^l
    ; Backup the current clipboard.
    ClipSaved := ClipboardAll
    ; Copy and save the current path.
    Send ^c
    ClipWait
    x = %Clipboard%
    ; Restore the clipboard.
    Clipboard := ClipSaved
    ClipSaved = ; Free the memory in case the clipboard was very large.
    ; Now, run the IPython notebook server.
    RunWait, ipython notebook --pylab inline --notebook-dir "%x%", , min
    return

    ; Press CTRL+ALT+P to kill all Python processes.
    ^!p::
    Run, taskkill /f /im python.exe, , min
    return

Save this script in a `ipynb.ahk` script and double-click on it. Then, pressing `CTRL+I` launches an IPython notebook server in the current directory of the active window.

Also, `CTRL+ALT+P` kills all Python processes, which can be used to stop the server. The `CTRL+C` command in the notebook server does not seem to work well on Windows.

Finally, you can put this AutoHotKey script in your Startup Windows folder so that this shortcut is available at any time.
