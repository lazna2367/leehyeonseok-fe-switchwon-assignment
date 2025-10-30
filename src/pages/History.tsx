import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../components/ui/table";
import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { exchangeApi } from "../api/orders";
import { Button } from "../components/ui/button";

export default function History() {
  const { data, isLoading } = useQuery({
    queryKey: ["orders", "list"],
    queryFn: exchangeApi.getOrdersList,
  });

  const rows = ((data as any)?.data || [])
    .map((o: any) => ({
      id: o.orderId,
      date: (o.orderedAt || "").replace("T", " "),
      buyAmount: o.toAmount, // 매수한 외화 수량
      rate: o.appliedRate,
      sellAmount: o.fromAmount, // 매도(지불) 금액 (KRW)
    }))
    .sort((a: any, b: any) => b.id - a.id);

  // pagination
  const pageSize = 10;
  const [page, setPage] = React.useState(1);
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  React.useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);
  const start = (page - 1) * pageSize;
  const pageRows = rows.slice(start, start + pageSize);

  return (
    <div>
      <div className="rounded-lg border border-border bg-white overflow-x-auto min-h-[610px]">
        <Table className="min-w-full text-[14px] table-fixed">
          <colgroup>
            <col className="w-[264px]" />
            <col className="w-[180px]" />
            <col className="w-[263px]" />
            <col className="w-[263px]" />
            <col className="w-[180px]" />
          </colgroup>
          <TableHeader className="bg-[#F7F8F9]">
            <TableRow className="h-12">
              <TableHead className="text-left px-10 text-[#646F7C]">
                거래 ID
              </TableHead>
              <TableHead className="text-left px-10 text-[#646F7C]">
                거래 일시
              </TableHead>
              <TableHead className="text-right px-10 text-[#646F7C]">
                매수 금액
              </TableHead>
              <TableHead className="text-right px-10 text-[#646F7C]">
                체결 환율
              </TableHead>
              <TableHead className="text-right px-10 text-[#646F7C]">
                매도 금액
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow className="h-[56px]">
                <TableCell colSpan={5} className="text-center">
                  불러오는 중...
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow className="h-[56px]">
                <TableCell colSpan={5} className="text-center">
                  내역이 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              pageRows.map((r: any) => (
                <TableRow key={r.id} className="h-[56px]">
                  <TableCell className="text-left font-medium px-10 py-4">
                    {r.id}
                  </TableCell>
                  <TableCell className="text-left px-10 py-4">
                    {r.date}
                  </TableCell>
                  <TableCell className="text-right px-10 py-4">
                    {Number(r.buyAmount).toLocaleString("ko-KR")}
                  </TableCell>
                  <TableCell className="text-right px-10 py-4">
                    {Number(r.rate).toLocaleString("ko-KR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell className="text-right px-10 py-4">
                    {Number(r.sellAmount).toLocaleString("ko-KR")}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {!isLoading && rows.length > 0 && (
        <div className="flex items-center justify-center gap-2 py-4">
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            aria-label="prev"
          >
            {"<"}
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Button
              key={p}
              variant={p === page ? "default" : "outline"}
              className={`h-8 min-w-8 px-3 ${
                p === page
                  ? "bg-[#3479EB] hover:bg-[#3479EB]/90 text-white"
                  : ""
              }`}
              onClick={() => setPage(p)}
            >
              {p}
            </Button>
          ))}
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            aria-label="next"
          >
            {">"}
          </Button>
        </div>
      )}
    </div>
  );
}
