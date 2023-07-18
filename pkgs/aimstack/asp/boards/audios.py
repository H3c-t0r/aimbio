from asp import AudioSequence

run_hash = None
if 'hash' in session_state:
    run_hash = session_state['hash']

ui.header("Audios")

if run_hash is None:
    form = ui.form("Search")
    query = form.text_input(value="")

audios = AudioSequence.filter(
    f'container.hash=="{run_hash}"' if run_hash else query)


def flatten(dictionary, parent_key="", separator="."):
    items = []
    for key, value in dictionary.items():
        new_key = parent_key + separator + key if parent_key else key
        if isinstance(value, dict):
            items.extend(flatten(value, new_key, separator=separator).items())
        else:
            items.append((new_key, value))
    return dict(items)


@memoize
def get_table_data(data=[], page_size=10, page_num=1):
    table_data = {}
    exclude_keys = [
        "type",
        "container_type",
        "sequence_type",
        "sequence_full_type",
        "hash",
        "axis_names",
        "item_type",
        "container_full_type",
        "values",
    ]

    page_data = data[(page_num - 1) * page_size: page_num * page_size]

    for i, page_item in enumerate(page_data):
        items = flatten(page_item).items()
        for key, value in items:
            if key in exclude_keys:
                continue
            else:
                if key == "blobs.data":
                    key = "data"
                    value = ((page_num - 1) * page_size) + i
                if key in table_data:
                    table_data[key].append(f"{value}")
                else:
                    table_data[key] = [f"{value}"]
    return table_data


row1, row2 = ui.rows(2)

with row1:
    items_per_page = ui.select(
        "Items per page", options=("5", "10", "50", "100"), index=1
    )
    page_num = ui.number_input(
        "Page", value=1, min=1, max=int(len(audios) / int(items_per_page)) + 1
    )

row2.table(
    get_table_data(audios, int(items_per_page), page_num),
    {
        "container.hash": lambda val: ui.board_link("run.py", val, state={"hash": val}),
        "data": lambda val: ui.audios([audios[int(val)]]),
    },
)
