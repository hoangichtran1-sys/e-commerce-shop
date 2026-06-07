import slug from "slug";

export function generateCategorySlug(name: string, subname?: string) {
    if (subname) {
        return slug(`${name} ${subname}`, { lower: true });
    }
    return slug(name, { lower: true });
}
