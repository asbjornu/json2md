# json2md

This is a project serving my very specific need of converting an old
[Movable Type blog export][format] to Markdown. To do the initial conversion
to JSON, the wonderful [movable_type_format][mtf] will do the job perfectly.

The resulting JSON file can then be jammed through `json2md`, producing one
`.md` file per article in the export.


[format]: https://movabletype.org/documentation/appendices/import-export-format.html
[mtf]: https://github.com/labocho/movable_type_format
