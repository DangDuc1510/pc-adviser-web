"use client";

import { Row, Col, Skeleton, Card } from "antd";

export default function RecommendationSkeleton({ count = 8 }) {
  return (
    <Row gutter={[24, 24]}>
      {Array.from({ length: count }).map((_, index) => (
        <Col xs={24} sm={12} md={8} lg={6} key={index}>
          <Card
            style={{
              borderRadius: 8,
              overflow: "hidden",
            }}
            cover={
              <Skeleton.Image className="w-full!"
                style={{
                  height: 200,
                }}
                active
              />
            }
          >
            <Skeleton active paragraph={{ rows: 2 }} />
            <Skeleton.Button active size="large" block style={{ marginTop: 16 }} />
          </Card>
        </Col>
      ))}
    </Row>
  );
}

