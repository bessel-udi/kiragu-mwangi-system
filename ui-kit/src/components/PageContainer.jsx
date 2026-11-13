// ui-kit/src/components/PageContainer.jsx
// Standard page wrapper: centred Bootstrap container with consistent vertical spacing.
// Usage: <PageContainer> ...page content... </PageContainer>
import Container from 'react-bootstrap/Container';

export default function PageContainer({ children, fluid = false, className = '', as = 'div' }) {
  return (
    <Container as={as} fluid={fluid} className={`py-4 py-md-5 ${className}`}>
      {children}
    </Container>
  );
}
