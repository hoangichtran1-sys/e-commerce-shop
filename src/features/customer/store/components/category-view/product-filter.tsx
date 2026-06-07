import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { capitalizeFirst, capitalizeWords, cn } from "@/lib/utils";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { FlameIcon, GemIcon, HeartIcon, LucideIcon, SearchIcon, StarIcon, TruckIcon } from "lucide-react";
import { Category } from "@/generated/prisma/client";
import { Badge } from "@/components/ui/badge";
import { Features } from "@/features/customer/types";
import { useProductsFilter } from "@/features/customer/hooks/use-products-filter";
import { MAX_PRODUCT_PRICE, MIN_PRODUCT_PRICE } from "@/constants";
import { useDebouncedCallback } from "use-debounce";
import { useMemo, useState } from "react";

interface ProductFilterProps {
    data: (Category & {
        _count: {
            products: number;
        };
    })[];
    attributesGroup: { title: string; options: string[] }[];
}

export const featuresOption: { label: string; value: Features; icon: LucideIcon }[] = [
    {
        label: "Best seller",
        value: "best_seller",
        icon: GemIcon,
    },
    {
        label: "Top Trending",
        value: "top_trending",
        icon: FlameIcon,
    },
    {
        label: "Free shipping",
        value: "free_shipping",
        icon: TruckIcon,
    },
    {
        label: "Top Rated (4+ starts)",
        value: "top_rated",
        icon: StarIcon,
    },
    {
        label: "Top Favorite (100+)",
        value: "top_favorite",
        icon: HeartIcon,
    },
];

export const ProductFilter = ({ data, attributesGroup }: ProductFilterProps) => {
    const [productsFilter, setProductsFilter] = useProductsFilter();

    const [search, setSearch] = useState(productsFilter.search || "");
    const [priceRange, setPriceRange] = useState<number[]>([
        productsFilter.minPrice || MIN_PRODUCT_PRICE,
        productsFilter.maxPrice || MAX_PRODUCT_PRICE,
    ]);

    const debounceSearch = useDebouncedCallback((searchValue: string) => {
        setProductsFilter({ search: searchValue });
    }, 300);

    const debouncePriceRange = useDebouncedCallback((priceRange: number[]) => {
        setProductsFilter({
            minPrice: priceRange[0],
            maxPrice: priceRange[1],
        });
    }, 300);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;

        setSearch(value);
        debounceSearch(value);
    };

    const handleToggleSelectSubcategory = (value: string) => {
        setProductsFilter((old) => {
            const currentSlugs = old.subcategorySlugs;
            const isIncluded = currentSlugs.includes(value);

            const nextSlugs = isIncluded ? currentSlugs.filter((slug) => slug !== value) : [...currentSlugs, value];

            return {
                ...old,
                subcategorySlugs: nextSlugs,
            };
        });
    };

    const handleToggleSelectFeature = (value: Features) => {
        setProductsFilter((old) => {
            const currentFeatures = old.features;
            const isIncluded = currentFeatures.includes(value);

            const nextFeatures = isIncluded ? currentFeatures.filter((slug) => slug !== value) : [...currentFeatures, value];

            return {
                ...old,
                features: nextFeatures,
            };
        });
    };

    const handleToggleSelectColor = (value: string) => {
        setProductsFilter((old) => {
            const currentColors = old.colors;
            const isIncluded = currentColors.includes(value);

            const nextColors = isIncluded ? currentColors.filter((c) => c !== value) : [...currentColors, value];

            return {
                ...old,
                colors: nextColors,
            };
        });
    };

    const handleToggleSelectSize = (value: string) => {
        setProductsFilter((old) => {
            const currentSizes = old.sizes;
            const isIncluded = currentSizes.includes(value);

            const nextSizes = isIncluded ? currentSizes.filter((c) => c !== value) : [...currentSizes, value];

            return {
                ...old,
                sizes: nextSizes,
            };
        });
    };

    const handleReset = () => {
        setProductsFilter({
            sizes: [],
            colors: [],
            features: [],
            subcategorySlugs: [],
            minPrice: null,
            maxPrice: null,
            search: null,
        });
    };

    const totalFilter = useMemo(() => {
        let total = 0;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        Object.entries(productsFilter).forEach(([_, val]) => {
            if (typeof val === "string" && val !== null) {
                total += 1;
            } else if (Array.isArray(val) && val.length > 0) {
                total += val.length;
            }
        });

        return total;
    }, [productsFilter]);

    return (
        <div className="mb-8 px-4 py-10 border-none overflow-y-auto">
            <div className="mb-6">
                <div className="flex items-center justify-between gap-2">
                    <h3 className="lg:text-xl text-sm font-semibold">Filters({totalFilter})</h3>
                    <Button onClick={handleReset} aria-label="Clear filter" variant="ghost" size="xs">
                        Reset
                    </Button>
                </div>
            </div>
            <div className="flex flex-col gap-y-10">
                <div className="flex flex-col items-start gap-y-4">
                    <Label htmlFor="search" className="text-sm font-medium">
                        Search
                    </Label>
                    <InputGroup>
                        <InputGroupInput value={search} onChange={handleChange} placeholder="Search products..." />
                        <InputGroupAddon>
                            <SearchIcon />
                        </InputGroupAddon>
                    </InputGroup>
                </div>
                <Separator />
                {data.length > 0 && (
                    <>
                        <div className="flex flex-col items-start gap-y-4">
                            <Label htmlFor="search" className="text-sm font-medium">
                                Subcategories
                            </Label>

                            <div className="grid grid-cols-3 lg:grid-cols-2 gap-2">
                                {data.map((item) => (
                                    <Button
                                        className="xl:min-w-30 max-w-full items-center justify-between gap-x-2"
                                        onClick={() => handleToggleSelectSubcategory(item.slug)}
                                        variant={productsFilter.subcategorySlugs.includes(item.slug) ? "default" : "outline"}
                                        key={item.id}
                                    >
                                        <span className="line-clamp-1">{capitalizeWords(item.name)}</span>
                                        <Badge
                                            className="rounded-md"
                                            variant={productsFilter.subcategorySlugs.includes(item.slug) ? "ghost" : "secondary"}
                                        >
                                            {item._count.products}
                                        </Badge>
                                    </Button>
                                ))}
                            </div>
                        </div>
                        <Separator />
                    </>
                )}
                <div className="flex flex-col items-start gap-y-4">
                    <div className="mx-auto grid w-full max-w-sm gap-4">
                        <div className="flex items-center justify-between gap-2">
                            <Label htmlFor="slider-price" className="text-sm font-medium">
                                Price Range
                            </Label>
                            <span className="text-gray-700 text-xs font-semibold">
                                ${priceRange[0]} – ${priceRange[1]}
                            </span>
                        </div>
                    </div>
                    <Slider
                        value={priceRange}
                        onValueChange={(val) => {
                            setPriceRange(val);
                            debouncePriceRange(val);
                        }}
                        min={MIN_PRODUCT_PRICE}
                        max={MAX_PRODUCT_PRICE}
                        step={50}
                        className="h-full flex-1"
                    />
                </div>
                <Separator />
                {attributesGroup.length > 0 && (
                    <>
                        <div className="space-y-4 border-0">
                            {attributesGroup.map((group) => (
                                <div key={group.title} className="space-y-2">
                                    <h4 className="text-sm font-semibold text-slate-700 mb-2">{capitalizeFirst(group.title)}:</h4>
                                    <div className="flex flex-wrap gap-3">
                                        {group.options.map((value) => (
                                            <div key={value}>
                                                {group.title === "color" && (
                                                    <div
                                                        onClick={() => handleToggleSelectColor(value)}
                                                        className={cn(
                                                            "rounded-md h-9 w-9 cursor-pointer border border-gray-400",
                                                            productsFilter.colors.includes(value) && "ring-2 ring-black ring-offset-2",
                                                        )}
                                                        style={{ backgroundColor: value }}
                                                        key={value}
                                                    />
                                                )}
                                                {group.title === "size" && (
                                                    <Button
                                                        key={value}
                                                        variant={productsFilter.sizes.includes(value) ? "default" : "outline"}
                                                        size="sm"
                                                        className="h-9 px-4 rounded-md"
                                                        onClick={() => handleToggleSelectSize(value)}
                                                    >
                                                        {value}
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Separator />
                    </>
                )}
                <div className="flex flex-col items-start gap-y-4">
                    <Label htmlFor="checkbox-featured" className="text-sm font-medium">
                        Features
                    </Label>
                    <div className="grid grid-cols-2 md:grid-cols-1 max-w-full gap-2">
                        {featuresOption.map((feature) => {
                            const Icon = feature.icon;
                            return (
                                <Button
                                    key={feature.value}
                                    onClick={() => handleToggleSelectFeature(feature.value)}
                                    variant={productsFilter.features.includes(feature.value) ? "default" : "outline"}
                                    className="w-full transition-colors py-4 px-12"
                                >
                                    <div className="flex items-center justify-start gap-x-2">
                                        <Icon />
                                        <span>{feature.label}</span>
                                    </div>
                                </Button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};
