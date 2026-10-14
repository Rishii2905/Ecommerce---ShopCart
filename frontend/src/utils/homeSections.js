const discountOf = (p) => (p.price && p.price.discountPercent) || 0;
const costOf = (p) => (p.price && p.price.cost) || 0;
const mrpOf = (p) => (p.price && p.price.mrp) || 0;

// Same shuffle for a whole day, changes the next day
const dailySeed = () => {
    const d = new Date();
    return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
};

const seededShuffle = (arr, seed) => {
    const a = [...arr];
    let s = seed;
    const rand = () => {
        s = (s * 9301 + 49297) % 233280;
        return s / 233280;
    };
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
};

// One product from each category in turn, so the list is varied
// One product from each category in turn, so the list is varied
const roundRobinByCategory = (products) => {
    const groups = {};
    products.forEach((p) => {
        (groups[p.category] = groups[p.category] || []).push(p);
    });
    const lists = Object.values(groups);
    const maxLen = Math.max(...lists.map((list) => list.length));
    const result = [];

    for (let i = 0; i < maxLen; i++) {
        for (const list of lists) {
            if (list[i]) result.push(list[i]);
        }
    }
    return result;
};

export const buildHomeSections = (products = []) => {
    const LIMIT = 10;
    const list = Array.isArray(products) ? products : [];

    if (!list.length) {
        return { topSelection: [], deals: [], suggested: [], budget: [], recommended: [] };
    }

    return {
        topSelection: [...list].sort((a, b) => mrpOf(b) - mrpOf(a)).slice(0, LIMIT),
        deals: [...list].sort((a, b) => discountOf(b) - discountOf(a)).slice(0, LIMIT),
        suggested: seededShuffle(list, dailySeed()).slice(0, LIMIT),
        budget: [...list]
            .filter((p) => costOf(p) <= 2500)
            .sort((a, b) => costOf(a) - costOf(b))
            .slice(0, LIMIT),
        recommended: roundRobinByCategory(list).slice(0, LIMIT),
    };
};