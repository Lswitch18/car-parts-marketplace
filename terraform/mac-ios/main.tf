terraform {
  required_version = ">= 1.6.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# 1. Aloca o Host Dedicado físico (Apple Silicon M2)
resource "aws_ec2_host" "mac_host" {
  instance_type     = "mac2-m2.metal"
  availability_zone = var.availability_zone
  auto_placement    = "on"

  tags = {
    Name        = "mac-ios-builder"
    Environment = "ios-build"
  }
}

# 2. Security Group efemero — so SSH (22) restrito ao seu IP (efemero: liga so pro build)
# Para atualizar seu IP antes do build: terraform apply -var="allowed_ssh_cidr=SEU.IP/32"
resource "aws_security_group" "mac_sg" {
  name        = "mac-ios-builder-sg"
  description = "Acesso SSH efemero para build iOS (sem VNC)"
  vpc_id      = var.vpc_id

  ingress {
    description = "SSH ephemeral"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.allowed_ssh_cidr]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "mac-ios-builder-sg"
  }
}

# 3. Instância Mac M2 com Usuário, Senha e VNC configurados no boot
resource "aws_instance" "mac_builder" {
  ami                         = var.ami_id
  instance_type               = "mac2-m2.metal"
  host_id                     = aws_ec2_host.mac_host.id
  subnet_id                   = var.subnet_id
  vpc_security_group_ids      = [aws_security_group.mac_sg.id]
  key_name                    = var.key_name
  associate_public_ip_address = true

  root_block_device {
    volume_size           = 120
    volume_type           = "gp3"
    delete_on_termination = true
  }

  # Efêmero: user_data mínimo (sem VNC). Instala Xcode toolchain + pods no primeiro boot.
  user_data = <<-EOF
    #!/bin/bash
    # 1. Senha ec2-user
    dscl . -passwd /Users/ec2-user "${var.mac_password}" || true
    echo "ec2-user:${var.mac_password}" | chpasswd || true

    # 2. SSH por senha (efêmero)
    sed -i '' 's/#PasswordAuthentication yes/PasswordAuthentication yes/' /etc/ssh/sshd_config || true
    sed -i '' 's/PasswordAuthentication no/PasswordAuthentication yes/' /etc/ssh/sshd_config || true
    launchctl kickstart -k system/com.openssh.sshd || true

    # 3. Toolchain base (best-effort — não bloqueia boot se falhar)
    export PATH=/opt/homebrew/bin:/usr/local/bin:$PATH
    which brew >/dev/null 2>&1 || /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)" || true
    brew install cocoapods node@22 2>&1 | tail -20 || true
  EOF

  tags = {
    Name = "mac-ios-builder"
  }
}
