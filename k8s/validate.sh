#!/bin/bash
# Kubernetes manifest validation script
# Validates YAML syntax and k8s resource definitions

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "========================================"
echo "K8s Manifest Validation"
echo "========================================"
echo ""

# Check if kubectl is installed
if ! command -v kubectl &> /dev/null; then
    echo -e "${YELLOW}Warning: kubectl not found${NC}"
    echo "Install kubectl to validate manifests"
    echo ""
    echo "Performing basic YAML syntax checks only..."
    echo ""
fi

# Function to check YAML syntax
check_yaml_syntax() {
    local file=$1
    if command -v python3 &> /dev/null; then
        python3 -c "import yaml; list(yaml.safe_load_all(open('$file')))" 2>/dev/null
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✓${NC} YAML syntax: $file"
            return 0
        else
            echo -e "${RED}✗${NC} YAML syntax error: $file"
            return 1
        fi
    else
        echo -e "${YELLOW}⚠${NC} Cannot validate YAML (python3 not found): $file"
        return 0
    fi
}

# Function to validate with kubectl
validate_kubectl() {
    local file=$1
    if command -v kubectl &> /dev/null; then
        kubectl apply --dry-run=client -f "$file" &> /dev/null
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✓${NC} kubectl validation: $file"
            return 0
        else
            echo -e "${RED}✗${NC} kubectl validation failed: $file"
            kubectl apply --dry-run=client -f "$file" 2>&1 | head -5
            return 1
        fi
    fi
}

# Track validation status
ERRORS=0

echo "Validating individual manifests..."
echo ""

# Validate namespace
echo "Namespace:"
check_yaml_syntax "namespace.yaml" || ((ERRORS++))
validate_kubectl "namespace.yaml" || ((ERRORS++))
echo ""

# Validate PostgreSQL
echo "PostgreSQL:"
for file in postgres/*.yaml; do
    check_yaml_syntax "$file" || ((ERRORS++))
    validate_kubectl "$file" || ((ERRORS++))
done
echo ""

# Validate API
echo "API:"
for file in api/*.yaml; do
    check_yaml_syntax "$file" || ((ERRORS++))
    validate_kubectl "$file" || ((ERRORS++))
done
echo ""

# Validate Web
echo "Web:"
for file in web/*.yaml; do
    check_yaml_syntax "$file" || ((ERRORS++))
    validate_kubectl "$file" || ((ERRORS++))
done
echo ""

# Validate secrets example
echo "Secrets Template:"
check_yaml_syntax "secrets.yaml.example" || ((ERRORS++))
validate_kubectl "secrets.yaml.example" || ((ERRORS++))
echo ""

# Validate kustomization
echo "Kustomization:"
check_yaml_syntax "kustomization.yaml" || ((ERRORS++))
if command -v kubectl &> /dev/null; then
    kubectl apply --dry-run=client -k . &> /dev/null
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓${NC} kustomize build successful"
    else
        echo -e "${RED}✗${NC} kustomize build failed"
        kubectl apply --dry-run=client -k . 2>&1 | head -10
        ((ERRORS++))
    fi
fi
echo ""

# Summary
echo "========================================"
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}All validations passed!${NC}"
    echo "Manifests are ready for deployment."
else
    echo -e "${RED}Found $ERRORS error(s)${NC}"
    echo "Please fix errors before deploying."
    exit 1
fi
echo "========================================"
echo ""

# Additional checks
echo "Additional Checks:"
echo ""

# Check for secrets.yaml
if [ -f "secrets.yaml" ]; then
    echo -e "${GREEN}✓${NC} secrets.yaml exists"
    # Check if it's still the example
    if grep -q "YOUR_SECURE_PASSWORD_HERE" secrets.yaml; then
        echo -e "${YELLOW}⚠${NC} secrets.yaml contains placeholder values"
        echo "  Update with real secrets before deploying"
    fi
else
    echo -e "${YELLOW}⚠${NC} secrets.yaml not found"
    echo "  Copy secrets.yaml.example to secrets.yaml and fill in values"
fi
echo ""

# Check gitignore
if grep -q "k8s/secrets.yaml" ../.gitignore; then
    echo -e "${GREEN}✓${NC} secrets.yaml is in .gitignore"
else
    echo -e "${YELLOW}⚠${NC} secrets.yaml is NOT in .gitignore"
    echo "  Add it to prevent committing secrets"
fi
echo ""

# Resource summary
echo "Resource Summary:"
echo ""
echo "Services:"
echo "  - postgres:5432 (ClusterIP)"
echo "  - api:8000 (ClusterIP)"
echo "  - web:3000 (ClusterIP)"
echo ""
echo "Storage:"
echo "  - postgres-pvc (10Gi)"
echo ""
echo "Replicas:"
echo "  - postgres: 1 (StatefulSet)"
echo "  - api: 2 (Deployment)"
echo "  - web: 2 (Deployment)"
echo ""
echo "Total Resources:"
echo "  - Memory Request: ~640Mi"
echo "  - Memory Limit: ~1.25Gi"
echo "  - CPU Request: ~250m"
echo "  - CPU Limit: ~1200m"
echo ""

exit 0
