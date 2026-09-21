variable "aws_region" {
  type        = string
  default     = "us-east-1"
  description = "Regiao da AWS (Virginia - us-east-1)"
}

variable "availability_zone" {
  type        = string
  default     = "us-east-1d"
  description = "Zona de Disponibilidade com suporte a mac2-m2"
}

variable "vpc_id" {
  type        = string
  default     = "vpc-0f25a75191041dce3"
  description = "VPC padrao da conta em us-east-1"
}

variable "subnet_id" {
  type        = string
  default     = "subnet-0a5fd1551353616c5"
  description = "Subnet publica em us-east-1d"
}

variable "key_name" {
  type        = string
  default     = "Ios-key"
  description = "Par de chaves SSH"
}

variable "ami_id" {
  type        = string
  default     = "ami-06529a1068d5c3720"
  description = "macOS Sonoma arm64 oficial da AWS em us-east-1"
}

variable "mac_password" {
  type        = string
  default     = "DaigIos2026!MacBuild"
  sensitive   = true
  description = "Senha do usuario ec2-user"
}

variable "allowed_ssh_cidr" {
  type        = string
  default     = "0.0.0.0/0"
  description = "CIDR liberado para SSH efêmero — troque para SEU_IP/32 antes do build"
}
