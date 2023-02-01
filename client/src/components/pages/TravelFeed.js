import React from "react"
// links for react bootstrap styling
import "../../styles/TravelFeed.css";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Image from 'react-bootstrap/Image';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Carousel from 'react-bootstrap/Carousel';

export default function TravelFeed() {
    return (
        // PROFILE CARD
        <Container className="travel">
            <Card className="pfp">
                <Row>
                    <Col xl={6} sm={6} xs={6}>
                        <Image src="https://wallpapers-clan.com/wp-content/uploads/2022/05/cute-pfp-02.jpg" alt="profile picture" roundedCircle thumbnail></Image>
                        <hr></hr>
                        <h5>Followers: 200</h5>
                        <h5>Posts: 90</h5>
                        <Button className="travelButton" size="sm">
                            Follow
                        </Button>
                        <Button className="travelButton" size="sm">
                            Block
                        </Button>
                        <Button className="travelButton" size="sm">
                            Message
                        </Button>
                    </Col>
                    <Col xl={6} sm={6} xs={6} >
                        <h3>Username</h3>
                        <p>Inset bio here</p>
                    </Col>
                </Row>
            </Card>
        {/* IMAGE CAROUSEL */}
            <Row className="test">
                <Carousel>
                    <Carousel.Item interval={3000}>
                        <img
                            className="d-block w-100"
                            src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1421&q=80"
                            alt="First slide"
                        />
                        <Carousel.Caption>
                            <h3>First slide label</h3>
                            <p>Nulla vitae elit libero, a pharetra augue mollis interdum.</p>
                        </Carousel.Caption>
                    </Carousel.Item>
                    <Carousel.Item interval={3000}>
                        <img
                            className="d-block w-100"
                            src="https://images.unsplash.com/photo-1660657407520-6f3c703ceff0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1374&q=80"
                            alt="Second slide"
                        />
                        <Carousel.Caption>
                            <h3>Second slide label</h3>
                            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                        </Carousel.Caption>
                    </Carousel.Item>
                    <Carousel.Item>
                        <img
                            className="d-block w-100"
                            src="https://images.unsplash.com/photo-1515859005217-8a1f08870f59?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1410&q=80"
                            alt="Third slide"
                        />
                        <Carousel.Caption>
                            <h3>Third slide label</h3>
                            <p>
                                Praesent commodo cursus magna, vel scelerisque nisl consectetur.
                            </p>
                        </Carousel.Caption>
                    </Carousel.Item>
                </Carousel>
            </Row>
            <Col className="comments">
                <Row>
                    <Card>
                        <p>date</p>
                        <p>Comment/Like</p>
                    </Card>
                </Row>
            </Col>
        </Container>
    );
}