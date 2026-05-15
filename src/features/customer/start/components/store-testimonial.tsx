"use client";

import { cn } from "@/lib/utils";
import { Star } from "lucide-react";
import * as React from "react";

type EmblaEventType = "init" | "pointerDown" | "pointerUp" | "scroll" | "select" | "settle" | "destroy" | "reInit" | "resize";

type CarouselApi = {
    scrollPrev: () => void;
    scrollNext: () => void;
    scrollTo: (index: number) => void;
    canScrollPrev: () => boolean;
    canScrollNext: () => boolean;
    selectedScrollSnap: () => number;
    scrollSnapList: () => number[];
    on: (event: EmblaEventType, callback: () => void) => void;
    off: (event: EmblaEventType, callback: () => void) => void;
};
import { Card, CardContent, CardHeader, CardFooter, CardTitle } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface Testimonial {
    id: number;
    name: string;
    role: string;
    image: string;
    review: string;
    rating: number;
}

const testimonials: Testimonial[] = [
    {
        id: 1,
        name: "Alison Dawn",
        role: "Developer",
        image: "https://notion-avatars.netlify.app/api/avatar?preset=female-1",
        review: "Pellentesque in ip sum dolor amet tellus vestibulum tincidunt. Pellentesque dignissim quis turpis quis faucibus.",
        rating: 4.5,
    },
    {
        id: 2,
        name: "Daniel Peter",
        role: "Product Designer",
        image: "https://notion-avatars.netlify.app/api/avatar?preset=male-2",
        review: "Pellentesque in ip sum dolor amet tellus vestibulum tincidunt. Pellentesque dignissim quis turpis quis faucibus.",
        rating: 5.0,
    },
    {
        id: 3,
        name: "Sarah Johnson",
        role: "Restaurant Owner",
        image: "https://notion-avatars.netlify.app/api/avatar?preset=female-3",
        review: "Pellentesque in ip sum dolor amet tellus vestibulum tincidunt. Pellentesque dignissim quis turpis quis faucibus.",
        rating: 4.8,
    },
    {
        id: 4,
        name: "Michael Chen",
        role: "Food Critic",
        image: "https://notion-avatars.netlify.app/api/avatar?preset=male-4",
        review: "Pellentesque in ip sum dolor amet tellus vestibulum tincidunt. Pellentesque dignissim quis turpis quis faucibus.",
        rating: 4.9,
    },
    {
        id: 5,
        name: "Emma Wilson",
        role: "Chef",
        image: "https://notion-avatars.netlify.app/api/avatar?preset=female-2",
        review: "Pellentesque in ip sum dolor amet tellus vestibulum tincidunt. Pellentesque dignissim quis turpis quis faucibus.",
        rating: 4.7,
    },
];

const RatingStars = ({ rating }: { rating: number }) => (
    <div className="flex items-center gap-1">
        {[...Array(5)].map((_, index) => (
            <Star key={index} className={cn("size-4", index < Math.floor(rating) ? "fill-foreground" : "fill-none")} />
        ))}
        <span className="text-muted-foreground ms-2 text-sm">({rating})</span>
    </div>
);

export const StoreTestimonial = ({ className }: { className?: string }) => {
    const [api, setApi] = React.useState<CarouselApi | null>(null);
    const [current, setCurrent] = React.useState(0);

    React.useEffect(() => {
        if (!api) return;

        const onSelect = () => {
            setCurrent(api.selectedScrollSnap());
        };

        api.on("select", onSelect);
        return () => {
            api.off("select", onSelect);
        };
    }, [api]);

    return (
        <section className={cn("py-12 lg:py-20", className)}>
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                <header className="mb-16 text-center">
                    <h2 className="text-3xl font-bold text-balance md:text-4xl">Our Clients Review</h2>
                </header>

                <Carousel
                    className="w-full"
                    setApi={(api) => {
                        // Only update state if api is defined
                        if (api) {
                            setApi(api);
                        } else {
                            setApi(null);
                        }
                    }}
                    opts={{
                        align: "start",
                        loop: true,
                    }}
                >
                    <CarouselContent className="-ml-1">
                        {testimonials.map((testimonial) => (
                            <CarouselItem key={testimonial.id} className="basis-full px-4 last:pe-0 sm:basis-1/2 lg:basis-1/3">
                                <Card className="h-full overflow-hidden border border-border py-6">
                                    <CardHeader className="gap-0 px-6">
                                        <div className="flex items-center gap-4">
                                            <Avatar className="bg-muted size-12">
                                                <AvatarImage src={testimonial.image} alt={testimonial.name} className="size-12" />
                                                <AvatarFallback className="bg-card">{testimonial.name[0]}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <CardTitle className="text-foreground font-semibold">{testimonial.name}</CardTitle>
                                                <p className="text-muted-foreground text-sm">{testimonial.role}</p>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="px-6">
                                        <p className="text-muted-foreground text-base">{testimonial.review}</p>
                                    </CardContent>
                                    <CardFooter className="bg-transparent border-t-0 px-6 pb-6">
                                        <RatingStars rating={testimonial.rating} />
                                    </CardFooter>
                                </Card>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious variant="outline" className="hidden cursor-pointer lg:flex" />
                    <CarouselNext variant="outline" className="hidden cursor-pointer lg:flex" />
                    <div className="mt-8 flex items-center justify-center gap-2">
                        {testimonials.map((_, index) => (
                            <Button
                                variant="ghost"
                                key={index}
                                onClick={() => api?.scrollTo(index)}
                                className={cn(
                                    "h-9 px-4 py-2",
                                    "size-2 cursor-pointer rounded-full p-0! transition-all",
                                    current === index ? "bg-foreground w-6" : "bg-muted",
                                )}
                                aria-label={`Go to slide ${index + 1}`}
                                aria-current={current === index ? "true" : "false"}
                            />
                        ))}
                    </div>
                </Carousel>
            </div>
        </section>
    );
};
