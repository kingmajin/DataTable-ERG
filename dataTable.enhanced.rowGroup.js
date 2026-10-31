/* Enhanced grouping for DataTables 3 and RowGroup 2. */
class Tableman {
    constructor(tableId, options) {
        if (typeof DataTable === 'undefined') throw new Error('Tableman requires DataTables.');
        if (!options || !Array.isArray(options.columns)) throw new Error('Tableman requires columns.');

        this.tableId = tableId;
        this.options = options;
        this.columns = options.columns;
        this.groupBy = options.grpEnable ? this.normaliseGroups(options.groupBy) : [];
        this.collapsed = new Set();
        this.controls = null;

        this.Datatable = new DataTable(tableId, {
            data: options.data,
            columns: options.columns,
            rowGroup: {
                enable: this.groupBy.length > 0,
                dataSrc: this.groupBy,
                startRender: (rows, group, level) => this.renderStart(rows, group, level),
                endRender: options.groupTotal?.length
                    ? (rows, group, level) => this.renderTotal(rows, group, level)
                    : null
            }
        });
        if (options.grpSelectEnable !== false) this.createControls();
        this.applyOrdering();
    }

    normaliseGroups(value) {
        const requested = Array.isArray(value) ? value : value == null ? [] : [value];
        const groups = requested.map(key => this.columns.find(column => String(column.data) === String(key))?.data);
        return [...new Set(groups)].filter(key => key !== undefined);
    }

    valueAt(row, key) {
        return String(key).split('.').reduce((value, part) => value == null ? undefined : value[part], row);
    }

    groupPath(rows, level) {
        const first = rows.data()[0];
        return this.groupBy.slice(0, level + 1).map(key => this.valueAt(first, key));
    }

    isHidden(path, includeSelf = true) {
        const length = includeSelf ? path.length : path.length - 1;
        for (let i = 1; i <= length; i++) {
            if (this.collapsed.has(JSON.stringify(path.slice(0, i)))) return true;
        }
        return false;
    }

    renderStart(rows, group, level) {
        const path = this.groupPath(rows, level);
        const key = JSON.stringify(path);
        const row = document.createElement('tr');
        row.className = 'tableman-group';
        row.style.display = this.isHidden(path, false) ? 'none' : '';

        const cell = document.createElement('td');
        cell.colSpan = rows.columns(':visible').count();
        cell.style.paddingLeft = `${level * 1.25 + 0.5}rem`;
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'tableman-toggle';
        button.setAttribute('aria-expanded', String(!this.collapsed.has(key)));
        const icon = document.createElement('span');
        icon.className = 'tableman-chevron';
        icon.setAttribute('aria-hidden', 'true');
        icon.textContent = this.collapsed.has(key) ? '▸' : '▾';
        button.append(icon, document.createTextNode(`${group ?? ''} (${rows.count()} rows)`));
        button.addEventListener('click', () => {
            if (this.collapsed.has(key)) this.collapsed.delete(key);
            else this.collapsed.add(key);
            this.Datatable.draw(false);
        });
        cell.append(button);
        row.append(cell);

        rows.nodes().each(node => {
            node.style.display = this.isHidden(path) ? 'none' : '';
        });
        return row;
    }

    renderTotal(rows, group, level) {
        const path = this.groupPath(rows, level);
        const row = document.createElement('tr');
        row.className = 'tableman-total';
        row.style.display = this.isHidden(path) ? 'none' : '';
        const totals = new Map();
        for (const item of this.options.groupTotal) {
            if (!this.columns.some(column => column.data === item.column)) continue;
            let sum = 0;
            rows.data().each(data => {
                const number = Number(this.valueAt(data, item.column));
                if (Number.isFinite(number)) sum += number;
            });
            totals.set(item.column, sum);
        }
        rows.columns(':visible').indexes().toArray().forEach((index, position) => {
            const cell = document.createElement('td');
            if (position === 0) cell.textContent = 'Total';
            if (totals.has(this.columns[index].data)) {
                cell.textContent = String(totals.get(this.columns[index].data));
            }
            row.append(cell);
        });
        return row;
    }

    applyOrdering() {
        const pre = this.groupBy.map(key => [this.columns.findIndex(column => column.data === key), 'asc']);
        this.Datatable.order.fixed({ pre });
        this.Datatable.draw(false);
    }

    setGroups(value) {
        this.groupBy = this.normaliseGroups(value);
        this.collapsed.clear();
        this.Datatable.rows().nodes().each(node => { node.style.display = ''; });
        this.Datatable.rowGroup().dataSrc(this.groupBy);
        this.Datatable.rowGroup().enable(this.groupBy.length > 0);
        this.applyOrdering();
        if (this.controls) {
            this.controls.querySelectorAll('input[type="checkbox"]').forEach(input => {
                input.checked = this.groupBy.some(key => String(key) === input.value);
            });
            this.updateControlLabel();
        }
    }

    changeGroup(groupBy) { this.setGroups(groupBy); }

    updateControlLabel() {
        this.controls.querySelector('summary').textContent =
            this.groupBy.length ? `Group by (${this.groupBy.length})` : 'Group by';
    }

    createControls() {
        const details = document.createElement('details');
        details.className = 'tableman-picker';
        const summary = document.createElement('summary');
        details.append(summary);
        const choices = document.createElement('div');
        choices.className = 'tableman-choices';
        this.columns.forEach(column => {
            if (!['string', 'number'].includes(typeof column.data)) return;
            const label = document.createElement('label');
            const input = document.createElement('input');
            input.type = 'checkbox';
            input.value = String(column.data);
            input.checked = this.groupBy.some(key => String(key) === input.value);
            input.addEventListener('change', () => {
                this.setGroups([...choices.querySelectorAll('input:checked')].map(box => box.value));
            });
            label.append(input, document.createTextNode(` ${column.title ?? column.data}`));
            choices.append(label);
        });
        details.append(choices);
        const container = this.Datatable.table().container();
        container.insertBefore(details, container.firstChild);
        this.controls = details;
        this.updateControlLabel();
    }
}
