import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MinusIcon, Package2Icon, PlusIcon, RefreshCcwIcon, RefreshCwIcon, Trash2Icon, ZapIcon } from "lucide-react";
import { NoResults } from "@/components/no-results";
import { generateSKU } from "@/lib/generate-product-sku";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { ButtonGroup } from "@/components/ui/button-group";
import { capitalizeFirst } from "@/lib/utils";
import { DEFAULT_VARIANT } from "@/constants";

interface VariantItem {
    sku: string;
    price: number;
    stock: number;
    combination: Record<string, string>;
}

interface VariantsTableProps {
    variants: VariantItem[];
    backupVariants: VariantItem[];
    onChange: (updatedVariants: VariantItem[]) => void;
    productName: string;
}

export function VariantsTable({ variants, backupVariants, onChange, productName }: VariantsTableProps) {
    const [bulkPrice, setBulkPrice] = useState<string>("");
    const [bulkStock, setBulkStock] = useState<string>("");

    const handleApplyBulk = () => {
        const updated = variants.map((v) => ({
            ...v,
            price: bulkPrice ? Number(bulkPrice) : v.price,
            stock: bulkStock ? Number(bulkStock) : v.stock,
        }));
        onChange(updated);
    };

    const handleInputChange = (index: number, field: keyof VariantItem, value: string | number) => {
        const updated = [...variants];
        updated[index] = {
            ...updated[index],
            [field]: value,
        };
        onChange(updated);
    };

    const handleRemoveVariant = (index: number) => {
        const updated = variants.filter((_, i) => i !== index);
        onChange(updated);
    };

    if (variants.length === 0) {
        return <NoResults topic="variants" icon={Package2Icon} />;
    }

    return (
        <div className="space-y-4">
            {/* --- BULK EDIT  --- */}
            <div className="bg-slate-50 p-3 rounded-lg border flex flex-wrap items-center gap-3 text-sm">
                <div className="flex items-center gap-1 font-medium text-slate-700">
                    <ZapIcon className="size-4 text-amber-500 fill-amber-500" />
                    <span>Apply quickly:</span>
                </div>
                <Input
                    type="number"
                    placeholder="General price..."
                    className="w-32 bg-white"
                    value={bulkPrice}
                    onChange={(e) => setBulkPrice(e.target.value)}
                />
                <Input
                    type="number"
                    placeholder="General stock..."
                    className="w-32 bg-white"
                    value={bulkStock}
                    onChange={(e) => setBulkStock(e.target.value)}
                />
                <Button type="button" variant="secondary" size="sm" onClick={handleApplyBulk}>
                    Applicable to {variants.length} records
                </Button>
                {variants.length > 1 && (
                    <Button
                        variant="outline"
                        title={`Clear all ${variants.length} records`}
                        onClick={() => onChange([DEFAULT_VARIANT])}
                        type="button"
                        size="icon"
                    >
                        <Trash2Icon />
                    </Button>
                )}
                {variants.length > 0 && (
                    <Button
                        variant="outline"
                        title="Refresh old variants"
                        onClick={() => onChange(JSON.parse(JSON.stringify(backupVariants || variants)))}
                        type="button"
                        size="icon"
                    >
                        <RefreshCwIcon />
                    </Button>
                )}
            </div>

            {/* --- TABLE DATA --- */}
            <div className="rounded-md border bg-white overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50">
                        <TableRow>
                            <TableHead className="w-[25%]">Variants</TableHead>
                            <TableHead className="w-[35%]">SKU (*)</TableHead>
                            <TableHead className="w-[20%]">Price (*)</TableHead>
                            <TableHead className="w-[15%]">Stock (*)</TableHead>
                            <TableHead className="w-[5%] text-center"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {variants.map((item, index) => {
                            return (
                                <TableRow key={index} className="hover:bg-slate-50/50">
                                    <TableCell className="align-middle">
                                        <div className="flex flex-wrap gap-1">
                                            {Object.keys(item.combination).length === 0 && <Badge variant="secondary">No attributes</Badge>}
                                            {Object.entries(item.combination).map(([key, val]) => (
                                                <Badge key={key} variant="outline" className="px-1.5 py-0.5 text-xs bg-slate-100">
                                                    <span className="text-muted-foreground mr-1">{capitalizeFirst(key)}:</span>
                                                    <span className="font-semibold text-slate-800">{val}</span>
                                                </Badge>
                                            ))}
                                        </div>
                                    </TableCell>

                                    <TableCell>
                                        <InputGroup>
                                            <InputGroupInput
                                                type="text"
                                                placeholder="SKU code"
                                                className="font-mono text-xs uppercase"
                                                value={item.sku}
                                                onChange={(e) => handleInputChange(index, "sku", e.target.value.toUpperCase())}
                                            />
                                            <InputGroupAddon align="inline-end">
                                                <InputGroupButton
                                                    title="Generate code"
                                                    aria-label="Generate SKU"
                                                    onClick={() => {
                                                        const sku = generateSKU(productName, item.combination);
                                                        handleInputChange(index, "sku", sku);
                                                    }}
                                                    size="icon-xs"
                                                >
                                                    <RefreshCcwIcon className="text-muted-foreground" />
                                                </InputGroupButton>
                                            </InputGroupAddon>
                                        </InputGroup>
                                    </TableCell>

                                    <TableCell>
                                        <InputGroup>
                                            <InputGroupInput
                                                type="number"
                                                className="pl-6 text-right"
                                                min={0.01}
                                                step={0.01}
                                                placeholder="0.01"
                                                value={item.price || ""}
                                                onChange={(e) => handleInputChange(index, "price", Number(e.target.value))}
                                            />
                                            <InputGroupAddon>$</InputGroupAddon>
                                        </InputGroup>
                                    </TableCell>

                                    <TableCell>
                                        <ButtonGroup>
                                            <Input
                                                type="number"
                                                className="text-center min-w-15"
                                                min="0"
                                                step={1}
                                                placeholder="0"
                                                value={item.stock ?? ""}
                                                onChange={(e) => handleInputChange(index, "stock", Number(e.target.value))}
                                            />
                                            <Button
                                                onClick={() => {
                                                    handleInputChange(index, "stock", item.stock - 1);
                                                }}
                                                variant="outline"
                                                type="button"
                                                size="icon-sm"
                                                disabled={item.stock === 0}
                                                className="min-h-8"
                                            >
                                                <MinusIcon />
                                            </Button>
                                            <Button
                                                onClick={() => {
                                                    handleInputChange(index, "stock", item.stock + 1);
                                                }}
                                                variant="outline"
                                                type="button"
                                                size="icon-sm"
                                                className="min-h-8"
                                            >
                                                <PlusIcon />
                                            </Button>
                                        </ButtonGroup>
                                    </TableCell>

                                    <TableCell className="text-center">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive hover:bg-destructive/10 size-8"
                                            onClick={() => handleRemoveVariant(index)}
                                            disabled={Object.keys(item.combination).length === 0}
                                        >
                                            <Trash2Icon className="size-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
