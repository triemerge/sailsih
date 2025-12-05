import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatIndianNumber } from '@/lib/indian-formatter';

function MatrixTable({ stockyards = [] }) {
  const materials = [...new Set(stockyards.map((s) => s.material))].sort();
  const stockyardIds = [...new Set(stockyards.map((s) => s.id))].sort();

  const stockyardMap = stockyards.reduce((acc, s) => {
    const qty = parseFloat(s.quantity) || 0;
    acc[`${s.material}-${s.id}`] = qty;
    return acc;
  }, {});

  if (stockyards.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No stockyard data available
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-semibold">Material</TableHead>
            {stockyardIds.map((id) => (
              <TableHead key={id} className="text-center">
                {id}
              </TableHead>
            ))}
            <TableHead className="text-right font-semibold">Total</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {materials.map((material) => {
            const rowTotal = stockyardIds.reduce((sum, id) => {
              const qty = stockyardMap[`${material}-${id}`] || 0;
              return sum + qty;
            }, 0);

            return (
              <TableRow key={material}>
                <TableCell className="font-medium">{material}</TableCell>
                
                {stockyardIds.map((id) => {
                  const qty = stockyardMap[`${material}-${id}`];
                  return (
                    <TableCell key={id} className="text-center">
                      {qty > 0 ? (
                        <Badge variant={qty > 2000 ? 'success' : 'secondary'}>
                          {formatIndianNumber(qty)}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  );
                })}
                
                <TableCell className="text-right font-semibold">
                  {formatIndianNumber(rowTotal)} MT
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

export default MatrixTable;
