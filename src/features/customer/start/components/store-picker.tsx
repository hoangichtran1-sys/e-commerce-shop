"use client";

import { orpc } from "@/orpc/orpc-rq.client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { StoreCard } from "./store-card";
import { authClient } from "@/lib/auth-client";
import { NoResults } from "@/components/no-results";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { SearchIcon, StoreIcon, ArrowRight, TrendingUp, ShoppingBag } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";

export const StorePicker = () => {
    const user = authClient.useSession();

    const { data: stores } = useSuspenseQuery(orpc.customer.getStores.queryOptions());

    const [searchQuery, setSearchQuery] = useState("");
    const [api, setApi] = useState<{
        selectedScrollSnap: () => number;
        scrollTo: (index: number) => void;
    }>();
    const [currentSlide, setCurrentSlide] = useState(0);

    // Auto-scroll functionality
    useEffect(() => {
        if (!api) return;

        const interval = setInterval(() => {
            const nextSlide = (currentSlide + 1) % stores.length;
            api.scrollTo(nextSlide);
            setCurrentSlide(nextSlide);
        }, 5000);

        return () => clearInterval(interval);
    }, [api, currentSlide, stores.length]);

    if (stores.length === 0) {
        return <NoResults icon={StoreIcon} topic="stores" isAdmin={user?.data?.user.role === "admin"} />;
    }

    return (
        <section className="from-background to-accent/20 relative bg-linear-to-b">
            <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
                <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
                    <header className="flex flex-col gap-8">
                        <Badge variant="outline" className="h-auto w-fit font-semibold rounded-full px-4 py-2 flex items-center gap-2">
                            <TrendingUp className="size-4" />
                            New stores 2026
                        </Badge>

                        <h1 className="text-5xl leading-tight font-bold text-balance md:text-6xl lg:text-7xl">Lorem ipsum dolor</h1>

                        <p className="text-muted-foreground max-w-lg text-xl text-balance">
                            Lorem ipsum dolor sit, amet consectetur adipisicing elit. Tempore error assumenda, dolorem obcaecati ipsum inventore
                            architecto. Illum velit voluptatum perspiciatis porro ullam veniam, non sed, deserunt dolores harum beatae reiciendis.
                        </p>

                        <div className="relative max-w-md">
                            <Input
                                type="search"
                                placeholder="Search stores..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-14 rounded-full pe-4 pl-12 text-lg"
                                aria-label="Search products"
                            />
                            <SearchIcon className="text-muted-foreground absolute inset-s-4 top-1/2 size-5 -translate-y-1/2" />
                            <Button size="lg" className="absolute inset-e-2 top-1/2 -translate-y-1/2 cursor-pointer rounded-full px-6 h-10">
                                Search
                            </Button>
                        </div>

                        <div className="flex items-center gap-4">
                            <Button size="lg" className="h-10 cursor-pointer rounded-full px-4">
                                Go Shop Now
                                <ArrowRight />
                            </Button>
                            <Button size="lg" variant="outline" className="h-10 cursor-pointer rounded-full px-4 justify-center">
                                <ShoppingBag />
                                View Shop
                            </Button>
                        </div>
                    </header>

                    <div className="flex flex-col gap-4">
                        <div className="relative h-125 w-full border-0">
                            <Carousel
                                className="group size-full"
                                setApi={setApi}
                                opts={{
                                    align: "start",
                                    loop: true,
                                    duration: 20,
                                    skipSnaps: true,
                                }}
                                onSelect={() => {
                                    if (api) {
                                        setCurrentSlide(api.selectedScrollSnap());
                                    }
                                }}
                            >
                                <CarouselContent className="h-full">
                                    {stores.map((store) => (
                                        <CarouselItem key={store.id} className="h-full">
                                            <StoreCard item={store} />
                                        </CarouselItem>
                                    ))}
                                </CarouselContent>
                            </Carousel>
                        </div>

                        {/* Dots Navigation - Enhanced */}
                        <div className="relative mt-8 flex justify-center gap-3">
                            {stores.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        api?.scrollTo(index);
                                        setCurrentSlide(index);
                                    }}
                                    className={`relative size-3 rounded-full transition-all ${currentSlide === index ? "bg-primary" : "bg-foreground/20 hover:bg-foreground/40"}`}
                                    aria-label={`Go to slide ${index + 1}`}
                                    aria-current={currentSlide === index ? "step" : undefined}
                                >
                                    {currentSlide === index && <span className="absolute inset-0 m-auto rounded-full" />}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
