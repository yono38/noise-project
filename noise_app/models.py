from django.db import models
from djangotoolbox.fields import ListField
from djangotoolbox.fields import EmbeddedModelField


# Create your models here.

class Audio(models.Model):
  id = models.PositiveIntegerField(primary_key=True)
  start = models.PositiveIntegerField()
  end = models.PositiveIntegerField()
  lat = models.FloatField()
  lng = models.FloatField()
  db_max = models.FloatField()
  db_min = models.FloatField()
  ds = ListField()
  s = ListField() #second
  m = ListField() #minute
  h = ListField() #hour
  si = ListField() #six hour period
  d = ListField() #day
  w = ListField() #week
  mo = ListField() #month

class Complaint(models.Model):
  agency = models.CharField(max_length=200)
  complaint_type = models.CharField(max_length=200)
  descriptor = models.TextField()
  location_type = models.CharField(max_length=200)
  incident_zip = models.PositiveIntegerField(max_length=200)
  unixtime = models.PositiveIntegerField()
  lat = models.FloatField()
  lng = models.FloatField()
