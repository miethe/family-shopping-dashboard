# Gifts are not linking to People as expected

**Date:** 2025-12-07

## Details

1. Whenever a Gift has been assigned to a Person as the recipient (via the "For (People)" field in the Gift creation/edit modals), the Person modal does not show that Gift in their "Linked Entities" section.
    - This must be fixed so that Gifts properly link to People and appear in their Linked Entities.
2. Attempting to update the MSRP Price of a Gift fails with the error:
    ```log
    File "/app/.venv/lib/python3.11/site-packages/sqlalchemy/engine/default.py", line 951, in do_execute

        cursor.execute(statement, parameters)

    File "/app/.venv/lib/python3.11/site-packages/sqlalchemy/dialects/postgresql/psycopg.py", line 597, in execute

        result = self.await_(self._cursor.execute(query, params, **kw))

                ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

    File "/app/.venv/lib/python3.11/site-packages/sqlalchemy/util/_concurrency_py3k.py", line 123, in await_only

        raise exc.MissingGreenlet(

    sqlalchemy.exc.MissingGreenlet: greenlet_spawn has not been called; can't call await_only() here. Was IO attempted in an unexpected place?
    ```
3. On the Person model on the /people page, each of the Budget Progress bars should only display if the Person has a budget set for that category (recipient or assignee/purchaser). Currently, they always display even if the budget is null, which is misleading.
    - If a person has no budget set, but does have gifts assigned in that category with prices available >$0, just show the totals for the given categories.
    - A person's modal could have any mix of [nothing rendered when no budget or gifts], [totals only when no budget but gifts exist], or [full progress bar when budget and gifts exist] for each of the progress bars for the two budget categories - recipientBudgetTotal and purchaserBudgetTotal.
4. On the Person modal, the Budgets should show a simple header above the totals with the labels of each "column":
    - "Purchased"
    - "Planned" (the total price of gifts assigned to that person in that category)
    - "Total Budget"
    - These headers should only display if the corresponding budget progress bar is shown and has the relevant values set.
    - These should be cleanly integrated into the budget section design, and will require some UI/UX design work to ensure clarity and usability.
