import { Divider, Box, Typography, Button, styled } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import Carousel from 'react-multi-carousel';
import "react-multi-carousel/lib/styles.css";

const Slide = ({ products = [], title, speed = 10000 }) => {
    const navigate = useNavigate();

    if (!products.length) return null;

    return (
        <Component>
            <Deal>
                <DealText>{title}</DealText>
                <ViewAllButton variant="contained" onClick={() => navigate("/Products")}>
                    View All
                </ViewAllButton>
            </Deal>

            <Divider />

            <Carousel
                swipeable
                draggable
                responsive={responsive}
                infinite
                autoPlay
                autoPlaySpeed={speed}
                keyBoardControl
                showDots={false}
                containerClass="carousel-container"
                itemClass="carousel-item-padding-40-px"
            >
                {products.map((product) => (
                    <Link key={product._id} to={`/product/view/${product._id}`} style={{ textDecoration: 'none' }}>
                        <Card>
                            {product.price && product.price.discountPercent > 0 && (
                                <Badge>{product.price.discountPercent}% OFF</Badge>
                            )}
                            <Image src={product.productImage} alt={product.productName} />
                            <TitleText>{product.productName}</TitleText>
                            <PriceRow>
                                <Price>₹{product.price && product.price.cost}</Price>
                                <Mrp>₹{product.price && product.price.mrp}</Mrp>
                            </PriceRow>
                            <Tagline>{product.tagline}</Tagline>
                        </Card>
                    </Link>
                ))}
            </Carousel>
        </Component>
    );
};

export default Slide;

const responsive = {
    desktop: { breakpoint: { max: 3000, min: 1024 }, items: 5 },
    tablet: { breakpoint: { max: 1024, min: 464 }, items: 2 },
    mobile: { breakpoint: { max: 464, min: 0 }, items: 1 },
};

const Component = styled(Box)`
    margin-top: 10px;
    background: #FFFFFF;
`;

const Deal = styled(Box)`
    display: flex;
    padding: 15px 20px;
`;

const DealText = styled(Typography)`
    font-size: 22px;
    font-weight: 600;
    line-height: 32px;
    margin-right: 25px;
`;

const ViewAllButton = styled(Button)`
    margin-left: auto;
    background-color: #4d1c9c;
    border-radius: 2px;
    font-size: 13px;
    &:hover { background-color: #7a1ccb; }
`;

const Card = styled(Box)`
    position: relative;
    margin: 12px 10px;
    padding: 16px 12px;
    text-align: center;
    border: 1px solid #eee;
    border-radius: 8px;
    transition: box-shadow 0.2s, transform 0.2s;
    &:hover {
        box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
        transform: translateY(-3px);
    }
`;

const Badge = styled(Box)`
    position: absolute;
    top: 10px;
    left: 10px;
    background: #2e7d32;
    color: #fff;
    font-size: 11px;
    font-weight: 600;
    padding: 3px 8px;
    border-radius: 4px;
`;

const Image = styled('img')({
    width: '100%',
    height: 150,
    objectFit: 'contain',
});

const TitleText = styled(Typography)`
    font-size: 14px;
    font-weight: 600;
    color: #212121;
    margin-top: 10px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const PriceRow = styled(Box)`
    display: flex;
    justify-content: center;
    align-items: baseline;
    gap: 8px;
    margin-top: 6px;
`;

const Price = styled(Typography)`
    font-size: 16px;
    font-weight: 700;
    color: #212121;
`;

const Mrp = styled(Typography)`
    font-size: 13px;
    color: #8a8a8a;
    text-decoration: line-through;
`;

const Tagline = styled(Typography)`
    font-size: 12px;
    color: #4d1c9c;
    margin-top: 4px;
`;