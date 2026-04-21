from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError

# --- СПРАВОЧНИКИ ---
class Directory(models.Model):
    name = models.CharField(max_length=255, verbose_name='Название')
    description = models.TextField(verbose_name='Описание', blank=True, null=True)

    class Meta:
        abstract = True

    def __str__(self):
        return self.name

class TechModel(Directory):
    class Meta: verbose_name = 'Модель техники'; verbose_name_plural = 'Модели техники'

class EngineModel(Directory):
    class Meta: verbose_name = 'Модель двигателя'; verbose_name_plural = 'Модели двигателя'

class TransModel(Directory):
    class Meta: verbose_name = 'Модель трансмиссии'; verbose_name_plural = 'Модели трансмиссии'

class DriveAxleModel(Directory):
    class Meta: verbose_name = 'Модель ведущего моста'; verbose_name_plural = 'Модели ведущих мостов'

class SteerAxleModel(Directory):
    class Meta: verbose_name = 'Модель управляемого моста'; verbose_name_plural = 'Модели управляемых мостов'

class MaintType(Directory):
    class Meta: verbose_name = 'Вид ТО'; verbose_name_plural = 'Виды ТО'

class FailureNode(Directory):
    class Meta: verbose_name = 'Узел отказа'; verbose_name_plural = 'Узлы отказа'

class RecoveryMethod(Directory):
    class Meta: verbose_name = 'Способ восстановления'; verbose_name_plural = 'Способы восстановления'

class ServiceCompany(Directory):
    user = models.OneToOneField(User, on_delete=models.SET_NULL, null=True, blank=True, verbose_name='Пользователь')
    class Meta: verbose_name = 'Сервисная компания'; verbose_name_plural = 'Сервисные компании'


# --- МАШИНА ---
class Machine(models.Model):
    machine_sn = models.CharField(max_length=100, unique=True, verbose_name='Зав. № машины')
    tech_model = models.ForeignKey(TechModel, on_delete=models.PROTECT, verbose_name='Модель техники')
    engine_model = models.ForeignKey(EngineModel, on_delete=models.PROTECT, verbose_name='Модель двигателя')
    engine_sn = models.CharField(max_length=100, verbose_name='Зав. № двигателя')
    trans_model = models.ForeignKey(TransModel, on_delete=models.PROTECT, verbose_name='Модель трансмиссии')
    trans_sn = models.CharField(max_length=100, verbose_name='Зав. № трансмиссии')
    drive_axle_model = models.ForeignKey(DriveAxleModel, on_delete=models.PROTECT, verbose_name='Модель ведущего моста')
    drive_axle_sn = models.CharField(max_length=100, verbose_name='Зав. № ведущего моста')
    steer_axle_model = models.ForeignKey(SteerAxleModel, on_delete=models.PROTECT, verbose_name='Модель управляемого моста')
    steer_axle_sn = models.CharField(max_length=100, verbose_name='Зав. № управляемого моста')
    
    delivery_contract = models.CharField(max_length=255, verbose_name='Договор поставки №, дата')
    shipment_date = models.DateField(verbose_name='Дата отгрузки с завода')
    consignee = models.CharField(max_length=255, verbose_name='Грузополучатель (конечный потребитель)')
    delivery_address = models.CharField(max_length=255, verbose_name='Адрес поставки (эксплуатации)')
    equipment = models.TextField(verbose_name='Комплектация (доп. опции)', blank=True)
    
    client = models.ForeignKey(User, on_delete=models.PROTECT, related_name='machines', verbose_name='Клиент')
    service_company = models.ForeignKey(ServiceCompany, on_delete=models.PROTECT, verbose_name='Сервисная компания')

    class Meta:
        verbose_name = 'Машина'
        verbose_name_plural = 'Машины'
        ordering = ['shipment_date']

    def __str__(self):
        return self.machine_sn


# --- ТО ---
class Maintenance(models.Model):
    maint_type = models.ForeignKey(MaintType, on_delete=models.PROTECT, verbose_name='Вид ТО')
    maint_date = models.DateField(verbose_name='Дата проведения ТО')
    operating_hours = models.IntegerField(verbose_name='Наработка, м/час')
    order_number = models.CharField(max_length=100, verbose_name='№ заказ-наряда')
    order_date = models.DateField(verbose_name='Дата заказ-наряда')

    maint_org = models.ForeignKey(ServiceCompany, on_delete=models.PROTECT, related_name='performed_maintenances', verbose_name='Организация, проводившая ТО')
    machine = models.ForeignKey(Machine, on_delete=models.CASCADE, related_name='maintenances', verbose_name='Машина')
    service_company = models.ForeignKey(ServiceCompany, on_delete=models.PROTECT, related_name='assigned_maintenances', verbose_name='Сервисная компания')

    def clean(self):
        if self.maint_date and self.machine.shipment_date:
            if self.maint_date < self.machine.shipment_date:
                raise ValidationError({
                    'maint_date': f'Дата ТО ({self.maint_date}) не может быть раньше даты отгрузки ({self.machine.shipment_date})'
                })

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    class Meta:
        verbose_name = 'ТО'
        verbose_name_plural = 'ТО'
        ordering = ['maint_date']


# --- РЕКЛАМАЦИИ ---
class Reclamation(models.Model):
    failure_date = models.DateField(verbose_name='Дата отказа')
    operating_hours = models.IntegerField(verbose_name='Наработка, м/час')
    failure_node = models.ForeignKey(FailureNode, on_delete=models.PROTECT, verbose_name='Узел отказа')
    failure_description = models.TextField(verbose_name='Описание отказа')
    recovery_method = models.ForeignKey(RecoveryMethod, on_delete=models.PROTECT, verbose_name='Способ восстановления')
    spare_parts = models.TextField(verbose_name='Используемые запасные части', blank=True)

    machine = models.ForeignKey(Machine, on_delete=models.CASCADE, related_name='reclamations', verbose_name='Машина')
    service_company = models.ForeignKey(ServiceCompany, on_delete=models.PROTECT, verbose_name='Сервисная компания')

    recovery_date = models.DateField(verbose_name='Дата восстановления')
    downtime = models.IntegerField(verbose_name='Время простоя техники', editable=False, default=0)

    # АВТОМАТИЧЕСКИЙ РАСЧЕТ ПРОСТОЯ
    def save(self, *args, **kwargs):
        if self.recovery_date and self.failure_date:
            self.downtime = (self.recovery_date - self.failure_date).days
        else:
            self.downtime = 0
        super().save(*args, **kwargs)

    class Meta:
        verbose_name = 'Рекламация'
        verbose_name_plural = 'Рекламации'
        ordering = ['failure_date']