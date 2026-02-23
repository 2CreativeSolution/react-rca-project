import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import {
  Box,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useMemo, useState } from "react";
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
  const [expandedParentIds, setExpandedParentIds] = useState<Record<string, boolean>>({});

  const childrenByParent = useMemo(() => {
    const map = new Map<string, CartLineItem[]>();

    lines.forEach((line) => {
      if (!line.isChild || !line.parentQuoteLineItemId) {
        return;
      }

      const siblings = map.get(line.parentQuoteLineItemId) ?? [];
      siblings.push(line);
      map.set(line.parentQuoteLineItemId, siblings);
    });

    return map;
  }, [lines]);

  const hasChildren = (line: CartLineItem): boolean =>
    Boolean(line.quoteLineItemId && childrenByParent.get(line.quoteLineItemId)?.length);

  const visibleLines = useMemo(() => {
    const ordered: CartLineItem[] = [];
    const rootLines = lines.filter((line) => !line.isChild);

    const appendLine = (line: CartLineItem): void => {
      ordered.push(line);

      if (!line.quoteLineItemId || !expandedParentIds[line.quoteLineItemId]) {
        return;
      }

      const children = childrenByParent.get(line.quoteLineItemId) ?? [];
      children.forEach((child) => appendLine(child));
    };

    rootLines.forEach((line) => appendLine(line));

    return ordered;
  }, [childrenByParent, expandedParentIds, lines]);

  const toggleExpanded = (line: CartLineItem): void => {
    if (!line.quoteLineItemId || !hasChildren(line)) {
      return;
    }

    setExpandedParentIds((previous) => ({
      ...previous,
      [line.quoteLineItemId as string]: !previous[line.quoteLineItemId as string],
    }));
  };

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
            {visibleLines.map((line) => {
              const draft = drafts[line.uiId] ?? {
                quantity: line.quantity?.toString() ?? "",
              };
              const isPending = linePendingId === line.uiId;
              const isMutable = Boolean(line.quoteLineItemId);
              const isEditableParent = isMutable && !line.isChild;
              const displayedLineTotal = line.lineTotal;
              const canToggleChildren = hasChildren(line);
              const isExpanded = Boolean(line.quoteLineItemId && expandedParentIds[line.quoteLineItemId]);

              return (
                <TableRow key={line.uiId}>
                  <TableCell>
                    <Stack alignItems="center" direction="row" spacing={0.5} sx={{ pl: line.depth > 0 ? line.depth * 2 : 0 }}>
                      {canToggleChildren ? (
                        <IconButton
                          aria-label={line.productName}
                          onClick={() => toggleExpanded(line)}
                          size="small"
                        >
                          {isExpanded ? (
                            <ExpandMoreRoundedIcon fontSize="small" />
                          ) : (
                            <ChevronRightRoundedIcon fontSize="small" />
                          )}
                        </IconButton>
                      ) : null}
                      <Typography variant="body2" sx={{ fontWeight: line.isChild ? 500 : 600 }}>
                        {line.productName}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell align="center">
                    {line.isChild ? (
                      <Typography variant="body2">{line.quantity ?? "-"}</Typography>
                    ) : (
                      <Box sx={{ display: "flex", justifyContent: "center" }}>
                        <TextField
                          type="number"
                          size="small"
                          value={draft.quantity}
                          inputProps={{ min: 1, step: 1 }}
                          disabled={!isEditableParent}
                          onChange={(event) => onDraftChange(line.uiId, { quantity: event.target.value })}
                          sx={{ width: 80 }}
                        />
                      </Box>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2">
                      {formatCurrency(line.unitPrice, currencyCode)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">{formatCurrency(displayedLineTotal, currencyCode)}</TableCell>
                  <TableCell align="center">
                    {line.isChild ? null : (
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Tooltip title={labels.saveLabel}>
                          <span>
                            <IconButton
                              size="small"
                              color="primary"
                              aria-label={labels.saveLabel}
                              disabled={isPending || !isEditableParent}
                              onClick={() => onSave(line)}
                            >
                              <SaveOutlinedIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title={labels.removeLabel}>
                          <span>
                            <IconButton
                              size="small"
                              color="error"
                              aria-label={labels.removeLabel}
                              disabled={isPending || !isEditableParent}
                              onClick={() => onRemove(line)}
                            >
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Stack>
                    )}
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
