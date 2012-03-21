Boxes (bxs) is a data- and content-management system which runs as remote XUL in Firefox. It needs a good cleanup, and proper testing and documentation, so at present I'm not providing full instructions here on how to use it.

It works by sending and consuming JSON via a RESTful interface, and is designed to work with a standard Rails CRUD setup, although should be reasonably backend agnostic (and in fact I've mainly been using it with a PHP backend based on the Zend Framework).

It requires a small Firefox plugin called bxtension, which I will be moving to GitHub shortly (it presently lives in Google Code). This provides a couple of necessary things: 1) A nice media upload manager similar to the Firefox download panel and 2) silent http digest authentication using xmlhttprequest (i.e., without popping up ugly login windows).

If you're interested in seeing bxs in action, or are otherwise interested in it, contact me on GitHub.