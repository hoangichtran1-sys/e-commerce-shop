import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { HeartIcon, SearchIcon, StarIcon, TruckIcon } from "lucide-react";

export const ProductFilter = () => {
    const [selectSize, setSelectSize] = useState("");
    const [selectColor, setSelectColor] = useState("");
    const [value, setValue] = useState<number[]>([100, 600]);
    const [checkedTopFavorited, setCheckedTopFavorited] = useState(false);
    const [checkedTopRated, setCheckedTopRated] = useState(false);
    const [checkedFreeShip, setCheckedFreeShip] = useState(false);

    return (
        <div className="mb-8 px-4 py-10 border-none overflow-y-auto">
            <div className="mb-6">
                <div className="flex items-center justify-between gap-2">
                    <h3 className="lg:text-xl text-sm font-semibold">Filters(5)</h3>
                    <Button aria-label="Clear filter" variant="ghost" size="xs">
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
                        <InputGroupInput placeholder="Search products..." />
                        <InputGroupAddon>
                            <SearchIcon />
                        </InputGroupAddon>
                        <InputGroupAddon align="inline-end">
                            <InputGroupButton aria-label="Search" size="xs" variant="ghost">
                                Run
                            </InputGroupButton>
                        </InputGroupAddon>
                    </InputGroup>
                </div>
                <Separator />
                <div className="flex flex-col items-start gap-y-4">
                    <div className="mx-auto grid w-full max-w-sm gap-4">
                        <div className="flex items-center justify-between gap-2">
                            <Label htmlFor="slider-price" className="text-sm font-medium">
                                Price Range
                            </Label>
                            <span className="text-gray-700 text-xs font-semibold">
                                {value[0]} – {value[1]} $
                            </span>
                        </div>
                    </div>

                    <Slider value={value} onValueChange={(val) => setValue(val as number[])} min={0} max={1000} step={5} className="h-full flex-1" />
                </div>
                <Separator />
                <div className="flex flex-col items-start gap-y-4">
                    <Label htmlFor="select-size" className="text-sm font-medium">
                        Size
                    </Label>
                    <div className="flex flex-wrap items-center gap-2">
                        {["XL", "XXL", "L", "L", "L", "L", "L", "L"].map((item, index) => (
                            <Button
                                onClick={() => setSelectSize(item)}
                                className="rounded-md"
                                variant={selectSize === item ? "default" : "outline"}
                                key={index}
                            >
                                {item}
                            </Button>
                        ))}
                    </div>
                </div>
                <Separator />
                <div className="flex flex-col items-start gap-y-4">
                    <Label htmlFor="select-color" className="text-sm font-medium">
                        Color
                    </Label>
                    <div className="flex flex-wrap items-center gap-3">
                        {["red", "green", "black", "green", "green", "green", "green"].map((item, index) => (
                            <div
                                onClick={() => setSelectColor(item)}
                                className={cn(
                                    "rounded-md h-8.5 w-8.5 cursor-pointer border border-gray-400",
                                    selectColor === item && "ring-2 ring-black ring-offset-2",
                                )}
                                style={{ backgroundColor: item }}
                                key={index}
                            />
                        ))}
                    </div>
                </div>
                <Separator />
                <div className="flex flex-col items-start gap-y-4">
                    <Label htmlFor="checkbox-featured" className="text-sm font-medium">
                        Features
                    </Label>
                    <div className="flex flex-col items-center gap-y-2">
                        <Button
                            onClick={() => setCheckedFreeShip((current) => !current)}
                            variant={checkedFreeShip ? "default" : "ghost"}
                            className="p-4 w-full transition-colors"
                        >
                            <TruckIcon />
                            Free Shipping
                        </Button>
                        <Button
                            onClick={() => setCheckedTopFavorited((current) => !current)}
                            variant={checkedTopFavorited ? "default" : "ghost"}
                            className="w-full transition-colors p-4"
                        >
                            <HeartIcon />
                            Top Favorited
                        </Button>
                        <Button
                            onClick={() => setCheckedTopRated((current) => !current)}
                            variant={checkedTopRated ? "default" : "ghost"}
                            className="w-full transition-colors p-4"
                        >
                            <StarIcon />
                            Top Rated (4+ starts)
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
