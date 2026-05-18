import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { StarIcon } from "lucide-react";
import Image from "next/image";

type Product = {
    id: number;
    title: string;
    image: string;
    price: number;
    rating: number;
};

const products: Product[] = [
    {
        id: 1,
        title: "Eclax Semispherical",
        image: "https://assets.shadcnstore.com/shadcnstore.com/stock/e-commerce/eclax-semispherical.600w.fa53b6.avif",
        price: 399,
        rating: 5,
    },
    {
        id: 2,
        title: "Eclax Cone",
        image: "https://assets.shadcnstore.com/shadcnstore.com/stock/e-commerce/eclax-cone.600w.ffc5c7.avif",
        price: 399,
        rating: 4,
    },
    {
        id: 3,
        title: "Eclax Cage Pack",
        image: "https://assets.shadcnstore.com/shadcnstore.com/stock/e-commerce/eclax-cage-pack.600w.03040e.avif",
        price: 399,
        rating: 5,
    },
    {
        id: 4,
        title: "Eclax Cage Pack",
        image: "https://assets.shadcnstore.com/shadcnstore.com/stock/e-commerce/eclax-cage-pack.600w.03040e.avif",
        price: 399,
        rating: 5,
    },
];

export const ProductsRelated = () => {
    return (
        <section className="px-12 py-6 mt-6">
        <h2 className='text-2xl font-bold text-balance md:text-xl mb-6'>Products Related</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
                <Card key={product.id} className="group overflow-hidden transition-all hover:shadow-lg">
                    <CardContent className="flex flex-col gap-4">
                        <div className="overflow-hidden rounded-md">
                            <Image
                                src={product.image}
                                alt={product.title}
                                width={200}
                                height={200}
                                className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <CardTitle className="line-clamp-1 text-lg font-semibold text-balance sm:text-xl">{product.title}</CardTitle>

                            <div className="flex items-center gap-0.5" aria-label={`${product.rating} out of 5 stars`} role="img">
                                {Array.from({ length: product.rating }).map((_, i) => (
                                    <StarIcon key={i} className="fill-foreground text-foreground size-4 sm:size-5" />
                                ))}
                            </div>

                            <p className="text-lg font-semibold sm:text-xl">${product.price.toFixed(2)}</p>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
       </section>
    );
};
