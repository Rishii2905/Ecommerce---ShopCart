import { InputBase, Box, Paper, Typography, styled } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getSearchedProducts } from '../../../redux/userHandle';

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// Lowercase and drop everything except letters and digits: "T-Shirt" -> "tshirt"
const normalize = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

// Every typed word must match the name, category, subcategory or tagline.
// Names that start with what you typed rank first.
const getSuggestions = (products, term) => {
    const tokens = term.toLowerCase().split(/\s+/).map(normalize).filter(Boolean);
    if (!tokens.length) return [];
    const query = tokens.join('');

    return products
        .map((p) => {
            const name = normalize(p.productName);
            const haystack = normalize(`${p.productName} ${p.category} ${p.subcategory} ${p.tagline}`);

            if (!tokens.every((t) => haystack.includes(t))) return null;

            let score = 0;
            if (name.startsWith(query)) score += 100;
            else if (name.includes(query)) score += 60;

            const words = String(p.productName || '').toLowerCase().split(/[\s-]+/).map(normalize);
            tokens.forEach((t) => {
                if (words.some((w) => w.startsWith(t))) score += 10;
                else if (name.includes(t)) score += 4;
            });

            return { product: p, score };
        })
        .filter(Boolean)
        .sort((a, b) => b.score - a.score || String(a.product.productName).localeCompare(String(b.product.productName)))
        .slice(0, 8)
        .map((x) => x.product);
};

// Bold the letters that match what was typed
const Highlight = ({ text, term }) => {
    const tokens = term.trim().split(/\s+/).map(normalize).filter(Boolean);
    if (!tokens.length) return <>{text}</>;

    const patterns = tokens.map((t) =>
        t.split('').map(escapeRegex).join('[\\s-]?')
    );

    const parts = String(text).split(new RegExp(`(${patterns.join('|')})`, 'gi'));
    return (
        <>
            {parts.map((part, i) =>
                i % 2 === 1 ? <b key={i}>{part}</b> : <span key={i}>{part}</span>
            )}
        </>
    );
};

const Search = () => {

    const navigate = useNavigate()
    const dispatch = useDispatch();
    const location = useLocation();

    const { productData } = useSelector(state => state.user);

    const [searchTerm, setSearchTerm] = useState("")
    const [open, setOpen] = useState(false)
    const [active, setActive] = useState(-1)

    const containerRef = useRef(null);

    const suggestions = useMemo(
        () => getSuggestions(Array.isArray(productData) ? productData : [], searchTerm),
        [productData, searchTerm]
    );

    // Close the list when clicking anywhere else
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = () => {
        const term = searchTerm.trim();
        if (!term) return;

        setOpen(false);
        setActive(-1);
        dispatch(getSearchedProducts("searchProduct", term));

        if (location.pathname !== "/ProductSearch") {
            navigate("/ProductSearch");
        }
    };

    const openProduct = (product) => {
        setOpen(false);
        setActive(-1);
        setSearchTerm(product.productName);
        navigate("/product/view/" + product._id);
    };

    const handleKeyDown = (e) => {
        // Rows: each suggestion, then the final "Search for ..." row
        const rows = suggestions.length + 1;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setOpen(true);
            setActive((prev) => (prev + 1) % rows);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActive((prev) => (prev <= 0 ? rows - 1 : prev - 1));
        } else if (e.key === 'Enter') {
            if (active >= 0 && active < suggestions.length) {
                openProduct(suggestions[active]);
            } else {
                handleSearch();
            }
        } else if (e.key === 'Escape') {
            setOpen(false);
            setActive(-1);
        }
    };

    const showList = open && searchTerm.trim().length > 0;

    return (
        <SearchContainer ref={containerRef}>
            <InputSearchBase
                placeholder="Search for products, brands and more"
                value={searchTerm}
                onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setOpen(true);
                    setActive(-1);
                }}
                onFocus={() => setOpen(true)}
                onKeyDown={handleKeyDown}
                inputProps={{ autoComplete: 'off' }}
            />
            <SearchIconWrapper onClick={handleSearch} sx={{ cursor: 'pointer' }}>
                <SearchIcon sx={{ color: "#4d1c9c" }} />
            </SearchIconWrapper>

            {showList &&
                <Paper
                    elevation={6}
                    sx={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        mt: '2px',
                        zIndex: 1500,
                        maxHeight: 440,
                        overflowY: 'auto',
                        borderRadius: '2px',
                    }}
                >
                    {suggestions.map((product, index) => (
                        <SuggestionRow
                            key={product._id}
                            $active={index === active}
                            onMouseEnter={() => setActive(index)}
                            onClick={() => openProduct(product)}
                        >
                            <SearchIcon sx={{ fontSize: 20, color: '#757575' }} />
                            <Box
                                component="img"
                                src={product.productImage}
                                alt=""
                                sx={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 1, backgroundColor: '#eee' }}
                            />
                            <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                                <Typography variant="body2" noWrap sx={{ color: '#212121' }}>
                                    <Highlight text={product.productName} term={searchTerm} />
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#757575' }}>
                                    in {product.category}
                                </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#212121' }}>
                                ₹{product.price && product.price.cost}
                            </Typography>
                        </SuggestionRow>
                    ))}

                    {suggestions.length === 0 &&
                        <Typography variant="body2" sx={{ px: 2, pt: 1.5, color: '#757575' }}>
                            No matching products found
                        </Typography>
                    }

                    <SuggestionRow
                        $active={active === suggestions.length}
                        onMouseEnter={() => setActive(suggestions.length)}
                        onClick={handleSearch}
                    >
                        <SearchIcon sx={{ fontSize: 20, color: '#4d1c9c' }} />
                        <Typography variant="body2" sx={{ color: '#4d1c9c', fontWeight: 600 }}>
                            Search for "{searchTerm.trim()}"
                        </Typography>
                    </SuggestionRow>
                </Paper>
            }
        </SearchContainer>
    )
}

const SearchContainer = styled(Box)`
  position: relative;
  border-radius: 2px;
  margin-left: 10px;
  width: 38%;
  background-color: #fff;
  display: flex;
`;

const SearchIconWrapper = styled(Box)`
  margin-left: auto;
  padding: 5px;
  display: flex;
  color: blue;
`;

const InputSearchBase = styled(InputBase)`
  font-size: unset;
  width: 100%;
  padding-left: 20px;
`;

const SuggestionRow = styled(Box, {
    shouldForwardProp: (prop) => prop !== '$active',
})(({ $active }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '8px 16px',
    cursor: 'pointer',
    color: '#212121',
    backgroundColor: $active ? '#f1ecfa' : '#fff',
}));

export default Search;