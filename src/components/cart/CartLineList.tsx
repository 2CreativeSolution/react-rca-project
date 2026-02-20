import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import {
  Box,
  Button,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import type { CartLineItem } from "../../services/salesforceApi";
import { formatCurrency } from "./formatters";

type CartLineDraft = {
  quantity: string;
};

type CartLineListProps = {
  currencyCode: string;
  lines: CartLineItem[];
  linePendingId: string | null;
  drafts: Record<string, CartLineDraft>;
  labels: {
    itemsTitle: string;
    productLabel: string;
    quantityLabel: string;
    unitPriceLabel: string;
    lineTotalLabel: string;
    actionsLabel: string;
    saveLabel: string;
    removeLabel: string;
  };
  onDraftChange: (lineId: string, patch: Partial<CartLineDraft>) => void;
  onSave: (line: CartLineItem) => void;
  onRemove: (line: CartLineItem) => void;
};

export default function CartLineList({
  currencyCode,
  lines,
  linePendingId,
  drafts,
  labels,
  onDraftChange,
  onSave,
  onRemove,
}: CartLineListProps) {
  return (
    <Paper variant="outlined" sx={{ borderRadius: 2.5, p: 2 }}>
      <Stack spacing={1.5}>
        <Typography variant="h6">{labels.itemsTitle}</Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{labels.productLabel}</TableCell>
              <TableCell align="center">{labels.quantityLabel}</TableCell>
              <TableCell align="center">{labels.unitPriceLabel}</TableCell>
              <TableCell align="center">{labels.lineTotalLabel}</TableCell>
              <TableCell align="center">{labels.actionsLabel}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {lines.map((line) => {
              const draft = drafts[line.uiId] ?? {
                quantity: line.quantity?.toString() ?? "",
              };
              const isPending = linePendingId === line.uiId;
              const isMutable = Boolean(line.quoteLineItemId);
              const displayedLineTotal = line.lineTotal;

              return (
                <TableRow key={line.uiId}>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {line.productName}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: "flex", justifyContent: "center" }}>
                      <TextField
                        type="number"
                        size="small"
                        value={draft.quantity}
                        inputProps={{ min: 1, step: 1 }}
                        disabled={!isMutable}
                        onChange={(event) => onDraftChange(line.uiId, { quantity: event.target.value })}
                        sx={{ width: 80 }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2">
                      {formatCurrency(line.unitPrice, currencyCode)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">{formatCurrency(displayedLineTotal, currencyCode)}</TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <Button
                        size="small"
                        color="error"
                        variant="outlined"
                        startIcon={<DeleteOutlineIcon fontSize="small" />}
                        disabled={isPending || !isMutable}
                        onClick={() => onRemove(line)}
                      >
                        {labels.removeLabel}
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<SaveOutlinedIcon fontSize="small" />}
                        disabled={isPending || !isMutable}
                        onClick={() => onSave(line)}
                      >
                        {labels.saveLabel}
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Stack>
    </Paper>
  );
}
