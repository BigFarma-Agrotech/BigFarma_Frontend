import Button from "@/components/shared/Button";

const DataTablePage = ({
  title,
  data,
  isLoading,
  error,
  refetch,
  columns = [],
  emptyState,
  hideHeader = false,
}) => {
  const rows = data || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white py-12 text-sm text-gray-600">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <span>Loading{title ? ` ${title}` : ""}...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center sm:p-6">
        <p className="mb-4 text-sm text-red-600">
          <strong>Error loading{title ? ` ${title}` : ""}:</strong>{" "}
          {error.response?.data?.detail ||
            error.message ||
            `Failed to load ${title}`}
        </p>
        <Button onClick={() => refetch()} className="h-10 py-0">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!hideHeader && (
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">{title}</h1>
          <span className="rounded-full bg-primary-subtle px-2.5 py-0.5 text-xs font-medium text-primary">
            {rows.length} {rows.length === 1 ? title.slice(0, -1) : title}
          </span>
        </div>
      )}

      {rows.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white px-4 py-12 sm:px-6">
          {emptyState}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      scope="col"
                      className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 sm:px-6"
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 bg-white">
                {rows.map((item) => (
                  <DataTableRow key={item.id} item={item} columns={columns} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

const DataTableRow = ({ item, columns }) => {
  return (
    <tr className="hover:bg-gray-50">
      {columns.map((column) => (
        <td
          key={column.key}
          className="whitespace-nowrap px-4 py-4 text-sm text-gray-700 sm:px-6"
        >
          {column.render ? column.render(item) : item[column.key]}
        </td>
      ))}
    </tr>
  );
};

export default DataTablePage;
