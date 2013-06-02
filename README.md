date-parse
==========

JS Date parse extension that not only understands more formats, but also converts
relative dates (like "20 days ago") into a timestamp.


Examples
--------

new Date(Date.parse("20s")); // Sun Jun 02 2013 16:15:47 GMT+0300 (IDT)
new Date(Date.parse("5 days ago")); // Tue May 28 2013 16:16:11 GMT+0300 (IDT)
new Date(Date.parse("15 May")); // Tue May 15 2001 00:00:00 GMT+0300 (IDT)
new Date(Date.parse("Thursday")); // Thu Jun 06 2013 16:16:21 GMT+0300 (IDT)

