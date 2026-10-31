# Enhanced RowGroup for DataTables

Adds a column picker, nested group expand/collapse, and numeric group totals to the official DataTables RowGroup extension. The wrapper does not require Bootstrap or jQuery.

The demo uses DataTables 3.1.5 and RowGroup 2.1.1. Open [index.html](index.html) to see it in use.

## Setup

Load DataTables and RowGroup before the wrapper:

```html
<link rel="stylesheet" href="https://cdn.datatables.net/3.1.5/css/dataTables.dataTables.min.css">
<link rel="stylesheet" href="https://cdn.datatables.net/rowgroup/2.1.1/css/rowGroup.dataTables.min.css">
<link rel="stylesheet" href="dataTable.enhanced.rowGroup.css">

<script src="https://cdn.datatables.net/3.1.5/js/dataTables.min.js"></script>
<script src="https://cdn.datatables.net/rowgroup/2.1.1/js/dataTables.rowGroup.min.js"></script>
<script src="dataTable.enhanced.rowGroup.js"></script>
```

## Usage

```js
const table = new Tableman('#example', {
    data: rows,
    columns: [
        { title: 'Country', data: 'country' },
        { title: 'State', data: 'state' },
        { title: 'Amount', data: 'amount' }
    ],
    grpEnable: true,
    groupBy: ['country', 'state'],
    grpSelectEnable: true,
    groupTotal: [{ column: 'amount' }]
});

table.changeGroup(['state']); // Change grouping at runtime
table.changeGroup([]);        // Disable grouping
table.Datatable;              // Access the underlying DataTables instance
```

| Option | Description |
| --- | --- |
| `data` | Array of row objects or arrays. |
| `columns` | DataTables column definitions. Required. |
| `grpEnable` | Enable initial grouping. Defaults to `false`. |
| `groupBy` | Column data key or array of keys, in nesting order. |
| `grpSelectEnable` | Show the column picker. Defaults to `true`. |
| `groupTotal` | Optional array of `{ column: 'numericKey' }` entries. |

Group counts and totals reflect rows on the current DataTables page after filtering, consistent with RowGroup's render callbacks. Nested groups show totals at each level.

## Bootstrap styling

The demo uses DataTables' default CSS. In a Bootstrap 4 or Bootstrap 5 application, use the matching DataTables and RowGroup styling integration files for that version. Keep `dataTable.enhanced.rowGroup.js` and `dataTable.enhanced.rowGroup.css`.

For Bootstrap 5, replace the two default DataTables and RowGroup CSS links above with `dataTables.bootstrap5.min.css` and `rowGroup.bootstrap5.min.css` from the same releases. After the core DataTables and RowGroup scripts, load `dataTables.bootstrap5.min.js` and `rowGroup.bootstrap5.min.js`. Bootstrap 4 uses the corresponding `bootstrap4` files.

The included `dataTables.rowGroup.min.js` is an older RowGroup 1.3.1 copy kept for reference. Do not load it alongside RowGroup 2.1.1; the demo uses the current release from the official CDN.
